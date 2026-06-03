import { sendAccountConfirmationEmail } from "@/lib/sendAccountConfirmationEmail";
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

    const {
      journeyId,
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

    const customerIdNum = customer.id_num || customer.ic_num;

    if (!customerIdNum || !customer.full_name || !customer.dob) {
      return NextResponse.json(
        { error: "Customer IC number, full name, and date of birth are required." },
        { status: 400 }
      );
    }

    if (!journeyId) {
      return NextResponse.json(
        { error: "Missing eKYC journey ID." },
        { status: 400 }
      );
    }


    const normalizedIdNum = customerIdNum.replace(/-/g, "").trim();

    const statusRes = await fetch(
      `${req.headers.get("origin") || "http://localhost:3000"}/api/ekyc/status?journeyId=${encodeURIComponent(journeyId)}`
    );

   const statusData = await statusRes.json();
   console.log("DEBUG statusData:", statusData);

   const scorecardLists = statusData.scorecard?.scorecardResultList || [];

   let totalChecks = 0;
   let passedChecks = 0;

   for (const scorecardItem of scorecardLists) {
     const checks = scorecardItem.checkResultList || [];

     for (const check of checks) {
       totalChecks++;

       if (check.checkStatus === "P") {
         passedChecks++;
       }
    }
   }

   if (totalChecks === 0) {
    return NextResponse.json(
      { error: "No scorecard checks found for this journey." },
      { status: 400 }
    );
  }

  const scorecardResult = Number(((passedChecks / totalChecks) * 100).toFixed(2));

  console.log("DEBUG scorecardResult:", scorecardResult);

  const statusIdType = statusData.id_type?.toLowerCase();
  const statusIdNum = statusData.id_num?.replace(/-/g, "").trim();

    if (
      statusData.status !== "face_verified" ||
      !["ic", "mykad", "nric"].includes(statusIdType) ||
      statusIdNum !== normalizedIdNum
    ) {
      return NextResponse.json(
        { error: "eKYC session was not verified. Please restart MyKad verification." },
        { status: 403 }
      );
    }

    const cleanHomeAddress = {
      add_1: homeAddress.add_1 || "",
      add_2: homeAddress.add_2 || "",
      postcode: homeAddress.postcode || "",
      state: homeAddress.state || "",
      country: homeAddress.country || "Malaysia",
    };

    const cleanCustomer = {
      id_num: normalizedIdNum,
      full_name: customer.full_name || "",
      id_type: customer.id_type || "IC",
      dob: customer.dob,
      ph_no: customer.ph_no || "",
      email: customer.email || "",
    };
    const idNumHash = hashLookup(cleanCustomer.id_num);

    const cleanUser = {
      username: user.username || "",
      password: user.password,
      status: user.status || "PENDING",
      sec_phrase: user.sec_phrase || "",
      branch: user.branch || "Main Branch",
    };

    const cleanSavings = {
      occupation: savingsAccount.occupation || "",
      monthly_income: savingsAccount.monthly_income || "",
      income_source: savingsAccount.income_source || "",
      employment_type: savingsAccount.employment_type || "",
      is18: savingsAccount.is18 !== undefined ? savingsAccount.is18 : true,
    };

    await client.query("BEGIN");

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

    if (mailingAddress) {
      const cleanMailingAddress = {
        add_1: mailingAddress.add_1 || "",
        add_2: mailingAddress.add_2 || "",
        postcode: mailingAddress.postcode || "",
        state: mailingAddress.state || "",
        country: mailingAddress.country || "Malaysia",
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

    
   const existingCustomerResult = await client.query(
     `
     SELECT cust_id
     FROM banka."Customer"
     WHERE id_num_hash = $1
     `,
     [idNumHash]
    );

  let custId: number;

  if (existingCustomerResult.rows.length > 0) {
    custId = existingCustomerResult.rows[0].cust_id;

    await client.query(
      `
      UPDATE banka."Customer"
      SET
        full_name = $1,
        id_type = $2,
        dob = $3,
        ph_no = $4,
        email = $5,
        home_add = $6
      WHERE cust_id = $7
      `,
      [
        encrypt(cleanCustomer.full_name, "banka"),
        cleanCustomer.id_type,
        cleanCustomer.dob,
        encrypt(cleanCustomer.ph_no, "banka"),
        encrypt(cleanCustomer.email, "banka"),
        homeAddId,
        custId,
      ]
   );
} else {
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
       idNumHash,
       encrypt(cleanCustomer.id_num, "banka"),
       encrypt(cleanCustomer.full_name, "banka"),
       cleanCustomer.id_type,
       cleanCustomer.dob,
       encrypt(cleanCustomer.ph_no, "banka"),
       encrypt(cleanCustomer.email, "banka"),
       homeAddId,
     ]
  );

  custId = customerResult.rows[0].cust_id;
}

    if (!cleanUser.password) {
      throw new Error("Password is missing");
    }

    const hashedPassword = await hashPassword(cleanUser.password);

    let profileBuffer: Buffer | null = null;
    if (user.img) {
      profileBuffer = user.img.startsWith("data:image")
        ? Buffer.from(user.img.split(",")[1], "base64")
        : Buffer.from(user.img);
    } else {
      profileBuffer = Buffer.alloc(0);
    }

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

    await client.query(
     `
      INSERT INTO banka."Journey" (
        journey_id,
        cust_id,
        application_date,
        approval_date,
        scorecard_result
      )
      VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $3)
      `,
      [
        journeyId,
        custId,
        scorecardResult,
      ]
    );

    await client.query("COMMIT");

  try{
    await sendAccountConfirmationEmail({
      to: cleanCustomer.email,
      fullName: cleanCustomer.full_name,
      accountType: "Malaysian Savings Account",
      accountNo: savingsResult.rows[0].account_no,
    });
  } catch (emailError) {
      console.error("Confirmation email failed:", emailError);
  }

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
      { error: error.message || "Failed to create Malaysian savings account application" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}