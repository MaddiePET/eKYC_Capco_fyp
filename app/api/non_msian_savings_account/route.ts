import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { hashPassword } from "@/scripts/hashpw";
import { encrypt, hashLookup } from "@/lib/cryptoSecurity";
export const runtime = "nodejs";

function generateAccountNumber() {
  let accountNo = "";
  for (let i = 0; i < 16; i++) {
    accountNo += Math.floor(Math.random() * 10).toString();
  }
  return accountNo;
}

export async function POST(req: Request) {
  const client = await pool.connect();

  try {
    const body = await req.json();

    console.log("=== RECEIVED PAYLOAD IN TERMINAL ===", JSON.stringify(body, null, 2));

    const {
      journeyId,
      customer,
      homeAddress,
      mailingAddress,
      user,
      savingsAccount,
    } = body;

    // 1. Core structural section validation
    if (!customer || !homeAddress || !user || !savingsAccount) {
      return NextResponse.json(
        { error: "Missing required submission sections." },
        { status: 400 }
      );
    }

    // Support passport, id_num, or ic_num variants from front-end OCR mapping
    const customerPassportNum = customer.passport_num || customer.id_num || customer.ic_num;

    if (!customerPassportNum || !customer.full_name || !customer.dob) {
      return NextResponse.json(
        { error: "Customer passport number, full name, and date of birth are required." },
        { status: 400 }
      );
    }

    if (!journeyId) {
      return NextResponse.json(
        { error: "Missing eKYC journey ID." },
        { status: 400 }
      );
    }

    const normalizedPassportNum = customerPassportNum.replace(/\s/g, "").toUpperCase().trim();

    // 2. Validate session verification status with external eKYC workflow
    const statusRes = await fetch(
      `${req.headers.get("origin") || "http://localhost:3000"}/api/ekyc/status?journeyId=${encodeURIComponent(journeyId)}`
    );

    const statusData = await statusRes.json();
    const statusIdType = statusData.id_type?.toLowerCase();
    const statusIdNum = statusData.id_num?.replace(/\s/g, "").toUpperCase().trim();

    if (
      statusData.status !== "face_verified" ||
      !["passport", "international_passport"].includes(statusIdType) ||
      statusIdNum !== normalizedPassportNum
    ) {
      return NextResponse.json(
        { error: "eKYC session was not verified. Please restart Passport verification." },
        { status: 403 }
      );
    }

    // 3. Prevent 'undefined' values from passing to encrypt() to satisfy NOT NULL constraints
    const cleanHomeAddress = {
      add_1: homeAddress.add_1 || "",
      add_2: homeAddress.add_2 || "", // Sanitized string fallback prevents encryption crashes
      postcode: homeAddress.postcode || "",
      state: homeAddress.state || "",
      country: homeAddress.country || "",
    };

    const cleanCustomer = {
      id_num: normalizedPassportNum,
      full_name: customer.full_name || "",
      id_type: "PASSPORT",
      dob: customer.dob,
      ph_no: customer.ph_no || "",
      email: customer.email || "",
    };

    const cleanUser = {
      username: user.username || "",
      password: user.password,
      status: user.status || "PENDING",
      sec_phrase: user.sec_phrase || "",
      branch: user.branch || "International Branch",
    };

    const cleanSavings = {
      occupation: savingsAccount.occupation || "",
      monthly_income: savingsAccount.monthly_income || "",
      income_source: savingsAccount.income_source || "",
      employment_type: savingsAccount.employment_type || "",
      is18: savingsAccount.is18 !== undefined ? savingsAccount.is18 : true,
    };

    // Begin DB Transaction
    await client.query("BEGIN");

    // Insert Home Address Row
    const homeAddressResult = await client.query(
      `
      INSERT INTO banka."Address" (add_1, add_2, postcode, state, country)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING add_id
      `,
      [
        cleanHomeAddress.add_1,
        cleanHomeAddress.add_2,
        cleanHomeAddress.postcode,
        cleanHomeAddress.state,
        cleanHomeAddress.country,
      ]
    );

    const homeAddId = homeAddressResult.rows[0].add_id;
    let mailingAddId = null;

    // Insert Mailing Address cleanly if configured
    if (mailingAddress) {
      const cleanMailingAddress = {
        add_1: mailingAddress.add_1 || "",
        add_2: mailingAddress.add_2 || "",
        postcode: mailingAddress.postcode || "",
        state: mailingAddress.state || "",
        country: mailingAddress.country || "",
      };

      const mailingAddressResult = await client.query(
        `
        INSERT INTO banka."Address" (add_1, add_2, postcode, state, country)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING add_id
        `,
        [
          cleanMailingAddress.add_1,
          cleanMailingAddress.add_2,
          cleanMailingAddress.postcode,
          cleanMailingAddress.state,
          cleanMailingAddress.country,
        ]
      );

      mailingAddId = mailingAddressResult.rows[0].add_id;
    }

    // Insert Customer Data using aes-256-gcm column encryption 
    const customerResult = await client.query(
      `
      INSERT INTO banka."Customer" (
        id_num_hash,
        id_num,
        full_name,
        id_type,
        dob,
        ph_no,
        email,
        home_add
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING cust_id
      `,
      [
        hashLookup(cleanCustomer.id_num),
        encrypt(cleanCustomer.id_num, "banka"),
        encrypt(cleanCustomer.full_name, "banka"),
        cleanCustomer.id_type,
        cleanCustomer.dob,
        encrypt(cleanCustomer.ph_no, "banka"),
        encrypt(cleanCustomer.email, "banka"),
        homeAddId,
      ]
    );

    const custId = customerResult.rows[0].cust_id;

    if (!cleanUser.password) {
      throw new Error("Password is missing");
    }

    const hashedPassword = await hashPassword(cleanUser.password);

    // Profile photo attachment formatting
    let profileBuffer: Buffer | null = null;
    if (user.img) {
      profileBuffer = user.img.startsWith("data:image")
        ? Buffer.from(user.img.split(",")[1], "base64")
        : Buffer.from(user.img);
    } else {
      profileBuffer = Buffer.alloc(0); // Safely fulfills NOT NULL constraint for bytea columns
    }

    // Insert User Configuration Row
    const userResult = await client.query(
      `
      INSERT INTO banka."User" (cust_id, username, password, status, img, sec_phrase, branch)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING user_id
      `,
      [
        custId,
        cleanUser.username,
        hashedPassword,
        cleanUser.status,
        profileBuffer,
        cleanUser.sec_phrase,
        cleanUser.branch,
      ]
    );

    const userId = userResult.rows[0].user_id;

    // Loop until unique Savings account number is generated
    let accountNo = generateAccountNumber();
    let accountExists = true;

    while (accountExists) {
      const checkAccount = await client.query(
        `SELECT account_no FROM banka."Savings_account" WHERE account_no = $1`,
        [accountNo]
      );

      if (checkAccount.rows.length === 0) {
        accountExists = false;
      } else {
        accountNo = generateAccountNumber();
      }
    }

    // Insert Savings Account Parameters
    const savingsResult = await client.query(
      `
      INSERT INTO banka."Savings_account" (account_no, user_id, occupation, monthly_income, income_source, employment_type, is18)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING account_no
      `,
      [
        accountNo,
        userId,
        cleanSavings.occupation,
        cleanSavings.monthly_income,
        cleanSavings.income_source,
        cleanSavings.employment_type,
        cleanSavings.is18,
      ]
    );

    await client.query("COMMIT");

    return NextResponse.json(
      {
        message: "Non-Malaysian savings account application created successfully",
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
    console.error("Non-Malaysian savings account error:", error);

    return NextResponse.json(
      { error: error.message || "Failed to create account application" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}