import fs from "fs";
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { hashPassword } from "@/hashpw";
import * as admin from "firebase-admin";

function loadFirebaseServiceAccount() {
  const jsonPath = process.env.FIREBASE_JPN_SERVICE_ACCOUNT_PATH;

  if (!jsonPath) {
    throw new Error("Missing FIREBASE_JPN_SERVICE_ACCOUNT_PATH environment variable");
  }

  return JSON.parse(fs.readFileSync(jsonPath, "utf8"));
}

let db: admin.firestore.Firestore | null = null;

function getDb() {
  if (!db) {
    admin.initializeApp({
      credential: admin.credential.cert(loadFirebaseServiceAccount()),
    });
    db = admin.firestore();
  }
  return db;
}

// Generates a random 16 digit savings account number
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
  // Get a database client from the connection pool
  const client = await pool.connect();

  try {
    // Read the JSON data sent from the frontend or Postman
    const body = await req.json();

    const {
      customer,
      homeAddress,
      mailingAddress,
      user,
      savingsAccount,
    } = body;

    // Make sure the required sections exist before inserting into database
    if (!customer || !homeAddress || !user || !savingsAccount) {
      return NextResponse.json(
        { error: "Missing required submission sections." },
        { status: 400 }
      );
    }

    if (!customer.ic_num || !customer.full_name || !customer.dob) {
      return NextResponse.json(
        { error: "Customer IC number, full name, and date of birth are required." },
        { status: 400 }
      );
    }

    const isVerified = await verifyIdentityInFirebase(customer.ic_num);
    if (!isVerified) {
      return NextResponse.json(
        {
          error:
            "eKYC verification failed: the provided IC number was not found in the government identity records.",
        },
        { status: 403 }
      );
    }

    // Start transaction so all inserts succeed together or fail together
    await client.query("BEGIN");

    // 1. Insert home address first
    // Customer.home_add will store this generated add_id
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

    // Store generated home address ID for Customer.home_add
    const homeAddId = homeAddressResult.rows[0].add_id;

    // 2. Insert mailing address only if it is provided
    // If user selected same as home address, frontend can skip mailingAddress
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

      // Store generated mailing address ID for response/reference
      mailingAddId = mailingAddressResult.rows[0].add_id;
    }

    // 3. Insert customer and link to home address using home_add
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
        customer.id_num,
        customer.full_name,
        customer.id_type || "IC",
        customer.dob,
        customer.ph_no_1,
        customer.email,
        homeAddId,
      ]
    );

    // Store generated customer ID for User table
    const custId = customerResult.rows[0].cust_id;

    //Ensures the passwords exists before hashing
    if (!user.password) {
      throw new Error("Password is missing");
    }

   //Gets the plain password from user from final submission payload
    const rawPassword = user.password;

    //Prevents storing password in plain text and hashed password before saving it in db
    const hashedPassword = await hashPassword(rawPassword);

    // 4. Insert user/login details and link to customer using cust_id
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
        hashedPassword, //Stores hashed password
        user.status || "Pending",
        user.img || null,
        user.sec_phrase,
        user.branch,
      ]
    );

    // Store generated user ID for Savings_account table
    const userId = userResult.rows[0].user_id;

    // 5. Generate a unique 16 digit savings account number
    let accountNo = generateAccountNumber();
    let accountExists = true;

    // Keep generating until the number does not already exist
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

    // 6. Insert savings account and link it to user using user_id
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

    // Save all changes permanently after every insert is successful
    await client.query("COMMIT");

    // Return success response to frontend/Postman
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
    // Undo all inserts if any query fails
    await client.query("ROLLBACK");

    console.error("Malaysian savings account error:", error);

    // Return error response to frontend/Postman
    return NextResponse.json(
      {
        error:
          error.message ||
          "Failed to create Malaysian savings account application",
      },
      { status: 500 }
    );
  } finally {
    // Release the database client back to the pool
    client.release();
  }
}