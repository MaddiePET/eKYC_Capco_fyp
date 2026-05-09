import fs from "fs";
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import * as admin from "firebase-admin";
import { hashPassword } from "@/hashpw";

function loadFirebaseServiceAccount(project: 'jim' | 'jpn') {
  const envVar = project === 'jim' ? 'FIREBASE_JIM_SERVICE_ACCOUNT_PATH' : 'FIREBASE_JPN_SERVICE_ACCOUNT_PATH';
  const jsonPath = process.env[envVar];

  if (!jsonPath) {
    throw new Error(`Missing ${envVar} environment variable`);
  }

  return JSON.parse(fs.readFileSync(jsonPath, "utf8"));
}

let jimDb: admin.firestore.Firestore | null = null;
let jpnDb: admin.firestore.Firestore | null = null;

function getJimDb() {
  if (!jimDb) {
    const appName = "jim-app";

    const jimApp = admin.apps.find((app) => app?.name === appName)
      || admin.initializeApp(
        {
          credential: admin.credential.cert(loadFirebaseServiceAccount("jim")),
        },
        appName
      );

    jimDb = jimApp.firestore();
  }
  return jimDb;
}

function getJpnDb() {
  if (!jpnDb) {
    const appName = "jpn-app";

    const jpnApp = admin.apps.find((app) => app?.name === appName)
      || admin.initializeApp(
        {
          credential: admin.credential.cert(loadFirebaseServiceAccount("jpn")),
        },
        appName
      );

    jpnDb = jpnApp.firestore();
  }
  return jpnDb;
}

// Generates a random 16 digit savings account number
function generateAccountNumber() {
  let accountNo = "";

  for (let i = 0; i < 16; i++) {
    accountNo += Math.floor(Math.random() * 10).toString();
  }

  return accountNo;
}

const JIM_NONRESIDENTS_COLLECTION = "jim_nonresidents";

async function verifyIdentityInFirebase(idNum: string) {
  if (!idNum) return false;

  const db = getJimDb();
  const docRef = db.collection(JIM_NONRESIDENTS_COLLECTION).doc(idNum);
  const docSnapshot = await docRef.get();
  if (docSnapshot.exists) {
    return true;
  }

  const passportQuery = await db
    .collection(JIM_NONRESIDENTS_COLLECTION)
    .where("passport_no", "==", idNum)
    .limit(1)
    .get();

  if (!passportQuery.empty) {
    return true;
  }

  const icQuery = await db
    .collection(JIM_NONRESIDENTS_COLLECTION)
    .where("ic_number", "==", idNum)
    .limit(1)
    .get();

  return !icQuery.empty;
}

export async function POST(req: Request) {
  const client = await pool.connect();

  try {
    const body = await req.json();

   // console.log("NON-MSIAN SUBMIT BODY:", JSON.stringify(body, null, 2));

    const {
      id_type,
      id_num,
      full_name,
      dob,
      ph_no_1,
      email,
      address,
      non_msian_details,
      non_msian_supporting_docs,
      user,
      savings_account,
    } = body;

    // Check required sections before inserting into database
    if (!address) {
      throw new Error("Address data is missing from request body");
    }

    if (!non_msian_details) {
      throw new Error("Non-Malaysian passport details are missing from request body");
    }

    if (!user) {
      throw new Error("User account data is missing from request body");
    }

    if (!savings_account) {
      throw new Error("Savings account data is missing from request body");
    }

    if (!id_num || !full_name || !dob || !ph_no_1 || !email) {
      throw new Error("Customer personal information is incomplete");
    }

    if (!address.add_1 || !address.postcode || !address.state || !address.country) {
      throw new Error("Address information is incomplete");
    }

    if (!user.username || !user.password || !user.sec_phrase || !user.branch) {
      throw new Error("User account information is incomplete");
    }

    const isVerified = await verifyIdentityInFirebase(id_num);
    if (!isVerified) {
      return NextResponse.json(
        {
          error:
            "eKYC verification failed: the provided passport/ID number was not found in the government identity records.",
        },
        { status: 403 }
      );
    }

    await client.query("BEGIN");

    // 1. Insert address first because Customer needs home_add as a foreign key
    const addressResult = await client.query(
      `
      INSERT INTO banka."Address"
      (
        add_type,
        add_1,
        add_2,
        postcode,
        state,
        country
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING add_id
      `,
      [
        address.add_type || "Home",
        address.add_1,
        address.add_2 || null,
        address.postcode,
        address.state,
        address.country,
      ]
    );

    const addId = addressResult.rows[0].add_id;

    // 2. Insert customer details and link customer to address using home_add
    const customerResult = await client.query(
      `
      INSERT INTO banka."Customer"
      (
        id_num,
        full_name,
        id_type,
        dob,
        ph_no_1,
        email,
        home_add
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING cust_id
      `,
      [
        id_num,
        full_name,
        id_type || "Passport",
        dob,
        ph_no_1,
        email,
        addId,
      ]
    );

    const custId = customerResult.rows[0].cust_id;

    // 3. Insert non-Malaysian passport details
    await client.query(
      `
      INSERT INTO banka."Non_msian_details"
      (
        cust_id,
        pp_issue_office,
        pp_issue_date,
        pp_exp_date,
        home_add_id
      )
      VALUES ($1, $2, $3, $4, $5)
      `,
      [
        custId,
        non_msian_details.pp_issue_office || null,
        non_msian_details.pp_issue_date || null,
        non_msian_details.pp_exp_date || null,
        addId,
      ]
    );

    // 4. Insert non-Malaysian supporting documents
    // This converts Base64 file data into Buffer before saving into PostgreSQL bytea column
    if (Array.isArray(non_msian_supporting_docs)) {
      for (const doc of non_msian_supporting_docs) {
        if (!doc?.doc_name || !doc?.doc_file) continue;

        const base64Part = doc.doc_file.includes(",")
          ? doc.doc_file.split(",")[1]
          : doc.doc_file;

        const fileBuffer = Buffer.from(base64Part, "base64");

        await client.query(
          `
          INSERT INTO banka."Non_msian_supporting_docs"
          (
            cust_id,
            doc_name,
            doc_file
          )
          VALUES ($1, $2, $3)
          `,
          [custId, doc.doc_name, fileBuffer]
        );
      }
    }

    const rawPassword = user.password;
    const hashedPassword = await hashPassword(rawPassword);

    // 6. Insert login/user profile details
    const userResult = await client.query(
      `
      INSERT INTO banka."User"
      (
        cust_id,
        username,
        password,
        status,
        img,
        sec_phrase,
        branch
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING user_id
      `,
      [
        custId,
        user.username,
        hashedPassword,
        user.status || "PENDING",
        user.img || null,
        user.sec_phrase,
        user.branch,
      ]
    );

    const userId = userResult.rows[0].user_id;

    // 7. Generate a unique 16 digit savings account number
    let accountNo = generateAccountNumber();
    let accountExists = true;

    while (accountExists) {
      const checkAccount = await client.query(
        `
        SELECT account_no
        FROM banka."Savings_account"
        WHERE account_no = $1
        `,
        [accountNo]
      );

      if (checkAccount.rows.length === 0) {
        accountExists = false;
      } else {
        accountNo = generateAccountNumber();
      }
    }

    // 8. Insert savings account details
    const savingsResult = await client.query(
      `
      INSERT INTO banka."Savings_account"
      (
        account_no,
        user_id,
        occupation,
        monthly_income,
        income_source,
        employment_type,
        is18
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING account_no
      `,
      [
        accountNo,
        userId,
        savings_account.occupation || null,
        savings_account.monthly_income || null,
        savings_account.income_source || null,
        savings_account.employment_type || null,
        savings_account.is18 ?? true,
      ]
    );

    await client.query("COMMIT");

    return NextResponse.json(
      {
        message: "Non-Malaysian savings account application created successfully",
        cust_id: custId,
        user_id: userId,
        account_no: savingsResult.rows[0].account_no,
      },
      { status: 201 }
    );
  } catch (error: any) {
    await client.query("ROLLBACK");

   // console.error("Non-Malaysian savings account error:", error);

    return NextResponse.json(
      {
        error:
          error.message ||
          "Failed to create non-Malaysian savings account application",
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}