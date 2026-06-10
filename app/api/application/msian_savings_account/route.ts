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

function enc(value: any) {
  return value ? encrypt(String(value), "banka") : null;
}

function mapGender(frontendGender: string) {
  switch (frontendGender) {
    case "M": return "M";
    case "F": return "F";
    case "Non-binary": return "NB";
    case "Prefer not to say": return "NONE";
    default: return "NONE";
  }
}

export async function POST(req: Request) {
  const client = await pool.connect();

  try {
    const body = await req.json();

    const {
      journeyId,
      isExistingCustomer, 
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
        { error: "Customer MyKad number, full name, and date of birth are required." },
        { status: 400 }
      );
    }

    const normalizedIdNum = customerIdNum.replace(/-/g, "").trim();
    const isExisting = isExistingCustomer === true;

    if (!isExisting && !journeyId) {
      return NextResponse.json(
        { error: "Missing eKYC journey ID." },
        { status: 400 }
      );
    }

    let scorecardResult = 100.00;

    if (!isExisting) {
      const statusRes = await fetch(
        `${req.headers.get("origin") || "http://localhost:3000"}/api/ekyc/status?journeyId=${encodeURIComponent(journeyId)}`
      );

      const statusData = await statusRes.json();

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

      scorecardResult = Number(((passedChecks / totalChecks) * 100).toFixed(2));

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
      gender: mapGender(customer.gender),
    };
    
    const idNumHash = hashLookup(cleanCustomer.id_num);

    const cleanUser = {
      username: user.username || "",
      password: user.password,
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

    let custId: number;
    let homeAddId = null;
    let mailingAddId = null;

    const existingCustomerResult = await client.query(
      `
      SELECT cust_id, home_add
      FROM banka."Customer"
      WHERE id_num_hash = $1
      `,
      [idNumHash]
    );

    if (existingCustomerResult.rows.length > 0) {
      custId = existingCustomerResult.rows[0].cust_id;
      homeAddId = existingCustomerResult.rows[0].home_add;

      // Verify if they already have a savings account
      const existingSavingsResult = await client.query(
        `
        SELECT s.account_no
        FROM banka."Savings_account" s
        JOIN banka."User" u ON s.user_id = u.user_id
        WHERE u.cust_id = $1
        LIMIT 1
        `,
        [custId]
      );

      if (existingSavingsResult.rows.length > 0) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          {
            error: "You already have a savings account with us. Please log in to continue.",
            redirectTo: "/login",
          },
          { status: 409 }
        );
      }
    } else {
      // Create home address with encrypted values
      const homeAddressResult = await client.query(
        `
        INSERT INTO banka."Address" (add_1, add_2, postcode, state, country)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING add_id
        `,
        [
          enc(cleanHomeAddress.add_1),
          enc(cleanHomeAddress.add_2),
          enc(cleanHomeAddress.postcode),
          enc(cleanHomeAddress.state),
          enc(cleanHomeAddress.country),
        ]
      );

      homeAddId = homeAddressResult.rows[0].add_id;

      if (mailingAddress) {
        const cleanMailingAddress = {
          add_1: mailingAddress.add_1 || "",
          add_2: mailingAddress.add_2 || "",
          postcode: mailingAddress.postcode || "",
          state: mailingAddress.state || "",
          country: mailingAddress.country || "Malaysia",
        };

        // Create mailing address with encrypted values
        const mailingAddressResult = await client.query(
          `
          INSERT INTO banka."Address" (add_1, add_2, postcode, state, country)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING add_id
          `,
          [
            enc(cleanMailingAddress.add_1),
            enc(cleanMailingAddress.add_2),
            enc(cleanMailingAddress.postcode),
            enc(cleanMailingAddress.state),
            enc(cleanMailingAddress.country),
          ]
        );

        mailingAddId = mailingAddressResult.rows[0].add_id;
      }

      // Create new customer record
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
          home_add,
          gender
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
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
          cleanCustomer.gender,
        ]
      );
      custId = customerResult.rows[0].cust_id;
    }

    if (!cleanUser.password) throw new Error("Password is missing");

    const usernameCheck = await client.query(
      `SELECT user_id FROM banka."User" WHERE LOWER(username) = LOWER($1)`,
      [cleanUser.username.trim()]
    );

    if (usernameCheck.rows.length > 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "This username is already taken. Please choose another." },
        { status: 400 }
      );
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

    // Push details straight to the user table linking to custId
    const userResult = await client.query(
      `
      INSERT INTO banka."User" (cust_id, username, password, img, sec_phrase, branch)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING user_id
      `,
      [
        custId,
        cleanUser.username,
        hashedPassword,
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
      if (checkAccount.rows.length === 0) accountExists = false;
      else accountNo = generateAccountNumber();
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

    // Save journey registration unconditionally using unique fallback keys with ON CONFLICT resolution
    const finalJourneyId = journeyId || `BYPASS-${custId}-${Date.now()}`;
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
      ON CONFLICT (journey_id) DO NOTHING
      `,
      [
        finalJourneyId,
        custId,
        scorecardResult,
      ]
    );

    await client.query("COMMIT");

    try {
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