import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { hashPassword } from "@/scripts/hashpw";
import { encrypt, hashLookup } from "@/lib/cryptoSecurity";
import { sendAccountConfirmationEmail } from "@/lib/sendAccountConfirmationEmail";

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

function getBaseUrl(req: Request): string {
  const host = req.headers.get("host");
  if (host) {
    const protocol = host.includes("localhost") ? "http" : "https";
    return `${protocol}://${host}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  const origin = req.headers.get("origin");
  if (origin) return origin;
  return "http://localhost:3000";
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
      nonMsianDetails,
      supportingDocs,
    } = body;

    if (!customer || !homeAddress || !user || !savingsAccount) {
      return NextResponse.json(
        { error: "Missing required submission sections." },
        { status: 400 }
      );
    }

    const customerPassportNum = customer.passport_num || customer.id_num || customer.ic_num;

    if (!customerPassportNum || !customer.full_name || !customer.dob) {
      return NextResponse.json(
        { error: "Customer Passport number, full name, and date of birth are required." },
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
    const baseUrl = getBaseUrl(req);
    const statusUrl = `${baseUrl}/api/ekyc/status?journeyId=${encodeURIComponent(journeyId)}`;

    let statusRes;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      statusRes = await fetch(statusUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
    } catch (fetchErr: any) {
      const msg = fetchErr?.name === "AbortError"
        ? "eKYC status request timed out after 10 seconds"
        : `Failed to fetch eKYC status: ${fetchErr?.message || fetchErr}`;
      throw new Error(msg);
    }

    if (!statusRes.ok) {
      let text = "";
      try {
        text = await statusRes.text();
      } catch (e) {
        text = "<unreadable response body>";
      }
      throw new Error(`eKYC status returned HTTP ${statusRes.status}: ${text.substring(0, 100)}`);
    }

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

    const scorecardResult = Number(((passedChecks / totalChecks) * 100).toFixed(2));
    const SCORECARD_PASS_THRESHOLD = 70;
    const statusIdType = statusData.id_type?.toLowerCase();
    const statusIdNum = statusData.id_num?.replace(/\s/g, "").toUpperCase().trim();

    if (
      statusData.status !== "face_verified" ||
      !["passport", "international_passport"].includes(statusIdType) ||
      (statusIdNum && statusIdNum !== normalizedPassportNum)
    ) {
      return NextResponse.json(
        { error: "eKYC session was not verified. Please restart Passport verification." },
        { status: 403 }
      );
    }

    if (scorecardResult < SCORECARD_PASS_THRESHOLD) {
      return NextResponse.json(
        {
          error: `Your eKYC verification score is ${scorecardResult}%, which is below the required threshold of ${SCORECARD_PASS_THRESHOLD}%. Please restart verification.`,
          scorecardResult,
          threshold: SCORECARD_PASS_THRESHOLD,
        },
        { status: 403 }
      );
    }

    const homeAdd2Str = homeAddress.add_2 ? homeAddress.add_2.trim() : "";
    const homeCityStr = homeAddress.city ? homeAddress.city.trim() : "";
    const combinedHomeAdd2 = [homeAdd2Str, homeCityStr].filter(Boolean).join(", ");

    const cleanHomeAddress = {
      add_1: homeAddress.add_1 || "",
      add_2: combinedHomeAdd2,
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
      gender: customer.gender,
    };

    const idNumHash = hashLookup(cleanCustomer.id_num);

    const cleanUser = {
      username: user.username || "",
      password: user.password,
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

    await client.query("BEGIN");

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

    const homeAddId = homeAddressResult.rows[0].add_id;
    let mailingAddId = null;

    if (mailingAddress) {
      const mailAdd2Str = mailingAddress.add_2 ? mailingAddress.add_2.trim() : "";
      const mailCityStr = mailingAddress.city ? mailingAddress.city.trim() : "";
      const combinedMailAdd2 = [mailAdd2Str, mailCityStr].filter(Boolean).join(", ");

      const cleanMailingAddress = {
        add_1: mailingAddress.add_1 || "",
        add_2: combinedMailAdd2,
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
          enc(cleanMailingAddress.add_1),
          enc(cleanMailingAddress.add_2),
          enc(cleanMailingAddress.postcode),
          enc(cleanMailingAddress.state),
          enc(cleanMailingAddress.country),
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
          home_add = $6,
          gender = $7
        WHERE cust_id = $8
        `,
        [
          encrypt(cleanCustomer.full_name, "banka"),
          cleanCustomer.id_type,
          cleanCustomer.dob,
          encrypt(cleanCustomer.ph_no, "banka"),
          encrypt(cleanCustomer.email, "banka"),
          homeAddId,
          cleanCustomer.gender,
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

    if (nonMsianDetails) {
      await client.query(
        `
        INSERT INTO banka."Non_msian_details" (
          cust_id,
          pp_issue_office,
          pp_issue_date,
          pp_exp_date,
          home_add_id
        )
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (cust_id) DO UPDATE SET
          pp_issue_office = EXCLUDED.pp_issue_office,
          pp_issue_date = EXCLUDED.pp_issue_date,
          pp_exp_date = EXCLUDED.pp_exp_date,
          home_add_id = EXCLUDED.home_add_id
        `,
        [
          custId,
          nonMsianDetails.pp_issue_office || null,
          nonMsianDetails.pp_issue_date || null,
          nonMsianDetails.pp_exp_date || null,
          homeAddId,
        ]
      );
    }

    if (supportingDocs && supportingDocs.length > 0) {
      for (const doc of supportingDocs) {
        let docBuffer = null;

        if (doc.doc_file) {
          const base64Data = doc.doc_file.includes(",")
            ? doc.doc_file.split(",")[1]
            : doc.doc_file;
          docBuffer = Buffer.from(base64Data, "base64");
        }

        await client.query(
          `
          INSERT INTO banka."Non_msian_supporting_docs" (cust_id, doc_name, doc_file)
          VALUES ($1, $2, $3)
          `,
          [custId, doc.doc_name || "Untitled Document", docBuffer]
        );
      }
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
      if (user.img.startsWith("http")) {
        profileBuffer = Buffer.from(user.img, "utf-8");
      } else if (user.img.startsWith("data:image")) {
        profileBuffer = Buffer.from(user.img.split(",")[1], "base64");
      } else {
        profileBuffer = Buffer.from(user.img, "base64");
      }
    }

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
      INSERT INTO banka."Savings_account" (
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
      ON CONFLICT (journey_id) DO NOTHING
      `,
      [journeyId, custId, scorecardResult || 85.0]
    );

    await client.query("COMMIT");

    try {
      await sendAccountConfirmationEmail({
        to: cleanCustomer.email,
        fullName: cleanCustomer.full_name,
        accountType: "Non-Malaysian Savings Account",
        accountNo: savingsResult.rows[0].account_no,
      });
    } catch (emailError) {
      console.error("Confirmation email failed:", emailError);
    }

    return NextResponse.json(
      {
        message: "Non-Malaysian savings account application created successfully.",
        cust_id: custId,
        user_id: userId,
        home_add_id: homeAddId,
        mailing_add_id: mailingAddId,
        account_no: savingsResult.rows[0].account_no,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Non-Malaysian savings account error:", error);

    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Rollback failed:", rollbackError);
    }

    return NextResponse.json(
      { error: error.message || "Failed to create Non-Malaysian savings account application" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}