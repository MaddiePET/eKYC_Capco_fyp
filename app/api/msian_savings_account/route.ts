import fs from "fs";
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { hashPassword } from "@/hashpw";
import * as admin from "firebase-admin";

export const runtime = "nodejs";

function loadFirebaseServiceAccount(project: 'jim' | 'jpn') {
  const envVar = project === 'jpn' ? 'FIREBASE_JPN_SERVICE_ACCOUNT_PATH' : 'FIREBASE_JIM_SERVICE_ACCOUNT_PATH';
  const jsonPath = process.env[envVar];

  if (!jsonPath) {
    throw new Error(`Missing ${envVar} environment variable`);
  }

  return JSON.parse(fs.readFileSync(jsonPath, "utf8"));
}

let db: admin.firestore.Firestore | null = null;

function getDb() {
  if (!db) {
    const appName = "jpn-app";

    const jpnApp = admin.apps.find((app) => app?.name === appName)
      || admin.initializeApp({
          credential: admin.credential.cert(loadFirebaseServiceAccount('jpn')),
        },
        appName
      );

    db = jpnApp.firestore();
  }
  return db;
}

function generateAccountNumber() {
  let accountNo = "";

  for (let i = 0; i < 16; i++) {
    accountNo += Math.floor(Math.random() * 10).toString();
  }

  return accountNo;
}

const JPN_CITIZENS_COLLECTION = "jpn_citizens";

async function verifyIdentityInFirebase(icNum: string) {
  if (!icNum) return false;

  const db = getDb();
  const docRef = db.collection(JPN_CITIZENS_COLLECTION).doc(icNum);
  const docSnapshot = await docRef.get();
  if (docSnapshot.exists) {
    return true;
  }

  const icQuery = await db
    .collection(JPN_CITIZENS_COLLECTION)
    .where("ic_number", "==", icNum)
    .limit(1)
    .get();

  return !icQuery.empty;
}

export async function POST(req: Request) {
  const client = await pool.connect();

  try {
    const body = await req.json();

    const {
      customer,
      homeAddress,
      mailingAddress,
      user,
      savingsAccount,
    } = body;

    if (!customer || !homeAddress || !user || !savingsAccount) {
      return NextResponse.json(
        { error: "Missing required submission sections." },
        { status: 400 }
      );
    }

    if (!(customer.ic_num || customer.id_num) || !customer.full_name || !customer.dob) {
      return NextResponse.json(
        { error: "Customer IC number, full name, and date of birth are required." },
        { status: 400 }
      );
    }

    const isVerified = await verifyIdentityInFirebase(customer.ic_num || customer.id_num);
    if (!isVerified) {
      return NextResponse.json(
        {
          error: "eKYC verification failed: the provided IC number was not found in the government identity records.",
        },
        { status: 403 }
      );
    }

    await client.query("BEGIN");

    const homeAddressResult = await client.query(
      `
      INSERT INTO banka."Address"
      (
        add_1,
        add_2,
        postcode,
        state,
        country
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING add_id
      `,
      [
        homeAddress.add_1,
        homeAddress.add_2,
        homeAddress.postcode,
        homeAddress.state,
        homeAddress.country,
      ]
    );

    const homeAddId = homeAddressResult.rows[0].add_id;

    let mailingAddId = null;

    if (mailingAddress) {
      const mailingAddressResult = await client.query(
        `
        INSERT INTO banka."Address"
        (
          add_1,
          add_2,
          postcode,
          state,
          country
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING add_id
        `,
        [
          mailingAddress.add_1,
          mailingAddress.add_2,
          mailingAddress.postcode,
          mailingAddress.state,
          mailingAddress.country,
        ]
      );

      mailingAddId = mailingAddressResult.rows[0].add_id;
    }

    const customerResult = await client.query(
      `
      INSERT INTO banka."Customer"
      (
        id_num,
        full_name,
        id_type,
        dob,
        ph_no,
        email,
        home_add
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING cust_id
      `,
      [
        customer.id_num || customer.ic_num,
        customer.full_name,
        customer.id_type || "IC",
        customer.dob,
        customer.ph_no,
        customer.email,
        homeAddId,
      ]
    );

    const custId = customerResult.rows[0].cust_id;

    if (!user.password) {
      throw new Error("Password is missing");
    }

    const rawPassword = user.password;
    const hashedPassword = await hashPassword(rawPassword);

    let profileBuffer: Buffer | string | null = null;
    if (user.img) {
      profileBuffer = user.img.startsWith("data:image")
        ? Buffer.from(user.img.split(",")[1], "base64")
        : Buffer.from(user.img); 
    }

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
        user.status || "Pending",
        profileBuffer || null,
        user.sec_phrase,
        user.branch,
      ]
    );

    const userId = userResult.rows[0].user_id;

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
        savingsAccount.occupation,
        savingsAccount.monthly_income,
        savingsAccount.income_source,
        savingsAccount.employment_type,
        savingsAccount.is18,
      ]
    );

    await client.query("COMMIT");

    return NextResponse.json(
      {
        message: "Malaysian savings account application created successfully",
        cust_id: custId,
        user_id: userId,
        home_add_id: homeAddId,
        mailing_add_id: mailingAddId,
        account_no: savingsResult.rows[0].account_no,
      },
      { status: 201 }
    );
  } catch (error: any) {
    await client.query("ROLLBACK");

    console.error("Malaysian savings account error:", error);

    return NextResponse.json(
      {
        error:
          error.message ||
          "Failed to create Malaysian savings account application",
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}