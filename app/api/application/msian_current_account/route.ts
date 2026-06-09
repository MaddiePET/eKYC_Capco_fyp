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

function hash(value: any) {
  return value
    ? hashLookup(String(value).replace(/-/g, "").trim().toUpperCase())
    : null;
}

function mapGender(frontendGender: string) {
  switch (frontendGender) {
    case "M":
      return "M";
    case "F":
      return "F";
    case "NB":
      return "NB";
    case "Non-binary":
      return "NB";
    case "NONE":
      return "NONE";
    case "Prefer not to say":
      return "NONE";
    default:
      return "NONE";
  }
}

export async function POST(req: Request) {
  const client = await pool.connect();

  try {
    const data = await req.json();

    const journeyId = data.journeyId || "";

    const applicationMode =
      data.applicationMode ||
      data.mode ||
      data.application_mode ||
      data.flow ||
      "new_user";

    const isAddAccountFlow =
      applicationMode === "existing_customer" ||
      applicationMode === "add_account";

    console.log("DEBUG applicationMode:", applicationMode);
    console.log("DEBUG isAddAccountFlow:", isAddAccountFlow);

    const personalInfo = data.personalInfo || {};
    const contactInfo = data.contactInfo || {};
    const businessContact = data.businessContact || {};
    const businessParticulars = data.businessParticulars || {};
    const businessAddressData = data.businessAddress || {};
    const account = data.account || {};
    const phoneVerification = data.phoneVerification || {};

    const customerIdNum =
      personalInfo.id_num ||
      personalInfo.idNumber ||
      personalInfo.ic_num;

    const customerFullName =
      personalInfo.fullName ||
      personalInfo.full_name;

    if (!customerIdNum || !customerFullName || !personalInfo.dob) {
      console.error("Missing required submission sections.", {
        extractedId: customerIdNum,
        extractedName: customerFullName,
        extractedDob: personalInfo.dob,
      });

      return NextResponse.json(
        {
          error:
            "Customer MyKad number, full name, and date of birth are required.",
        },
        { status: 400 }
      );
    }

    const cleanIdNum = String(customerIdNum)
      .replace(/-/g, "")
      .trim()
      .toUpperCase();

    let scorecardResult: number | null = null;

    if (!isAddAccountFlow) {
      if (!journeyId) {
        return NextResponse.json(
          { error: "Missing eKYC journey ID." },
          { status: 400 }
        );
      }

      const statusRes = await fetch(
        `${
          req.headers.get("origin") || "http://localhost:3000"
        }/api/ekyc/status?journeyId=${encodeURIComponent(journeyId)}`
      );

      const statusData = await statusRes.json();

      console.log("DEBUG business statusData:", statusData);

      const statusIdType = statusData.id_type?.toLowerCase();
      const statusIdNum = statusData.id_num
        ?.replace(/-/g, "")
        .trim()
        .toUpperCase();

      if (
        statusData.status !== "face_verified" ||
        !["ic", "mykad", "nric"].includes(statusIdType) ||
        statusIdNum !== cleanIdNum
      ) {
        return NextResponse.json(
          {
            error:
              "eKYC session was not verified. Please restart MyKad verification.",
          },
          { status: 403 }
        );
      }

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

      scorecardResult = Number(
        ((passedChecks / totalChecks) * 100).toFixed(2)
      );

      console.log("DEBUG business scorecardResult:", scorecardResult);
    }

    await client.query("BEGIN");

    const identityLookupHash = hashLookup(cleanIdNum);

    const customerPhone =
      personalInfo.ph_no ||
      phoneVerification.phoneNumber ||
      personalInfo.ph_no_1 ||
      businessContact.bus_ph_no ||
      businessContact.phoneNumber ||
      "";

    const customerEmail =
      personalInfo.email ||
      contactInfo.email ||
      businessContact.bus_email ||
      businessContact.email ||
      "";

    const customerGender = mapGender(personalInfo.gender);

    const existingCustomerCheck = await client.query(
      `
      SELECT cust_id, home_add
      FROM banka."Customer"
      WHERE id_num_hash = $1
      LIMIT 1
      `,
      [identityLookupHash]
    );

    let custId: number;
    let homeAddId: number | null = null;

    if (existingCustomerCheck.rows.length > 0) {
      custId = existingCustomerCheck.rows[0].cust_id;
      homeAddId = existingCustomerCheck.rows[0].home_add;

      console.log(
        `[CURRENT ACCOUNT] Existing customer found. Reusing cust_id: ${custId}, home_add: ${homeAddId}`
      );

      await client.query(
        `
        UPDATE banka."Customer"
        SET
          full_name = $1,
          id_type = $2,
          dob = $3,
          ph_no = $4,
          email = $5,
          gender = $6
        WHERE cust_id = $7
        `,
        [
          enc(customerFullName),
          personalInfo.id_type || "IC",
          personalInfo.dob,
          enc(customerPhone),
          enc(customerEmail),
          customerGender,
          custId,
        ]
      );
    } else {
      const personalAddress = {
        add_1:
          personalInfo.add_1 ||
          personalInfo.streetAddress ||
          personalInfo.add1 ||
          "",
        add_2:
          personalInfo.add_2 ||
          personalInfo.city ||
          personalInfo.add2 ||
          "",
        postcode:
          personalInfo.postcode ||
          personalInfo.postal ||
          "",
        state: personalInfo.state || "",
        country: personalInfo.country || "Malaysia",
      };

      if (!personalAddress.add_1) {
        throw new Error("Personal residential address Line 1 parameter is empty.");
      }

      const homeAddressRes = await client.query(
        `
        INSERT INTO banka."Address" (
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
          enc(personalAddress.add_1),
          enc(personalAddress.add_2),
          enc(personalAddress.postcode),
          enc(personalAddress.state),
          enc(personalAddress.country),
        ]
      );

      homeAddId = homeAddressRes.rows[0].add_id;

      const customerRes = await client.query(
        `
        INSERT INTO banka."Customer" (
          id_num_hash,
          id_num,
          full_name,
          id_type,
          dob,
          gender,
          ph_no,
          email,
          home_add
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING cust_id
        `,
        [
          identityLookupHash,
          enc(cleanIdNum),
          enc(customerFullName),
          personalInfo.id_type || "IC",
          personalInfo.dob,
          customerGender,
          enc(customerPhone),
          enc(customerEmail),
          homeAddId,
        ]
      );

      custId = customerRes.rows[0].cust_id;
    }

    const existingUserId = data.userId || data.user_id || null;
    let userId = existingUserId;

    if (!userId) {
      const targetUsername = account.username;

      if (!targetUsername) {
        throw new Error("Account registration username parameter is empty.");
      }

      const usernameCheck = await client.query(
        `
        SELECT user_id
        FROM banka."User"
        WHERE LOWER(username) = LOWER($1)
        `,
        [targetUsername.trim()]
      );

      if (usernameCheck.rows.length > 0) {
        return NextResponse.json(
          {
            error:
              "This user profile identifier username is already registered.",
          },
          { status: 400 }
        );
      }

      const rawPassword = account.password;

      if (!rawPassword) {
        throw new Error(
          "Account secure profile validation password parameter is missing."
        );
      }

      const hashedPassword = await hashPassword(rawPassword);

      let profileBuffer: Buffer | null = null;
      const imgData = account.profilePreview || account.img;

      if (imgData) {
        profileBuffer = imgData.startsWith("data:image")
          ? Buffer.from(imgData.split(",")[1], "base64")
          : Buffer.from(imgData);
      } else {
        profileBuffer = Buffer.alloc(0);
      }

      const userRes = await client.query(
        `
        INSERT INTO banka."User" (
          cust_id,
          username,
          password,
          img,
          sec_phrase,
          branch
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING user_id
        `,
        [
          custId,
          targetUsername.trim(),
          hashedPassword,
          profileBuffer,
          account.securityPhrase,
          businessAddressData.preferredBranch || "Main Branch",
        ]
      );

      userId = userRes.rows[0].user_id;
    }

    const businessAddress = {
      add_1:
        businessAddressData.businessAddress?.addressLine1 ||
        businessAddressData.addressLine1 ||
        "",
      add_2:
        businessAddressData.businessAddress?.addressLine2 ||
        businessAddressData.addressLine2 ||
        "",
      postcode:
        businessAddressData.businessAddress?.postcode ||
        businessAddressData.postcode ||
        "",
      state:
        businessAddressData.businessAddress?.state ||
        businessAddressData.state ||
        "",
      country:
        businessAddressData.businessAddress?.country ||
        businessAddressData.country ||
        "Malaysia",
    };

    if (!businessAddress.add_1) {
      throw new Error("Corporate operational business address Line 1 is empty.");
    }

    let businessAddId: number | null = null;
    let mailingAddId: number | null = null;

    const existingAccountNoFromPayload =
      businessParticulars.existing_account_no ||
      businessParticulars.existingAccountNo ||
      data.existing_account_no ||
      null;

    const currentAccountExistsFromPayload =
      businessParticulars.current_account_exists ||
      businessParticulars.currentAccountExists ||
      data.currentAccountExists ||
      false;

    const regNoRaw =
      businessParticulars.registration_number ||
      businessParticulars.reg_no ||
      businessParticulars.brn;

    const regNoHash = hash(regNoRaw);

    if (!regNoRaw || !regNoHash) {
      throw new Error("Business registration number is missing.");
    }

    const businessType =
      businessParticulars.business_type ||
      businessParticulars.bus_type ||
      "";

    const normalizedBusinessType = businessType.toLowerCase();

    const isSoleProprietorship =
      normalizedBusinessType.includes("sole proprietorship");

    const existingCurrentAccountRes = await client.query(
      `
      SELECT account_no, bus_add_id, mail_add_id
      FROM banka."Current_account"
      WHERE reg_no_hash = $1
      LIMIT 1
      `,
      [regNoHash]
    );

    let existingAccountNo: string | null = null;

    if (existingCurrentAccountRes.rows.length > 0) {
      existingAccountNo = existingCurrentAccountRes.rows[0].account_no;
      businessAddId = existingCurrentAccountRes.rows[0].bus_add_id;
      mailingAddId = existingCurrentAccountRes.rows[0].mail_add_id;
    }

    if (!existingAccountNo && existingAccountNoFromPayload) {
      existingAccountNo = existingAccountNoFromPayload;
    }

    if (existingAccountNo && isSoleProprietorship) {
      throw new Error(
        "A current account already exists for this sole proprietorship."
      );
    }

    let accountNo = existingAccountNo;

    if (!accountNo) {
      const businessAddressRes = await client.query(
        `
        INSERT INTO banka."Address" (
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
          enc(businessAddress.add_1),
          enc(businessAddress.add_2),
          enc(businessAddress.postcode),
          enc(businessAddress.state),
          enc(businessAddress.country),
        ]
      );

      businessAddId = businessAddressRes.rows[0].add_id;
      mailingAddId = businessAddId;

      const isMailingSameAsBusiness =
        businessAddressData.isMailingSameAsBusiness ?? true;

      if (!isMailingSameAsBusiness && businessAddressData.mailingAddress) {
        const mailingAddress = {
          add_1: businessAddressData.mailingAddress.addressLine1 || "",
          add_2: businessAddressData.mailingAddress.addressLine2 || "",
          postcode: businessAddressData.mailingAddress.postcode || "",
          state: businessAddressData.mailingAddress.state || "",
          country:
            businessAddressData.mailingAddress.country || "Malaysia",
        };

        const mailingAddressRes = await client.query(
          `
          INSERT INTO banka."Address" (
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
            enc(mailingAddress.add_1),
            enc(mailingAddress.add_2),
            enc(mailingAddress.postcode),
            enc(mailingAddress.state),
            enc(mailingAddress.country),
          ]
        );

        mailingAddId = mailingAddressRes.rows[0].add_id;
      }

      accountNo = generateAccountNumber();
      let accountExists = true;

      while (accountExists) {
        const checkAccount = await client.query(
          `
          SELECT account_no
          FROM banka."Current_account"
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

      await client.query(
        `
        INSERT INTO banka."Current_account" (
          account_no,
          user_id,
          reg_no_hash,
          reg_no,
          bus_name,
          bus_ph_no,
          bus_email,
          start_date,
          bus_type,
          bus_add_id,
          mail_add_id,
          role,
          msic_code,
          msic_name
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        `,
        [
          accountNo,
          userId,
          regNoHash,
          enc(regNoRaw),
          enc(
            businessParticulars.business_name ||
              businessParticulars.bus_name
          ),
          enc(businessContact.bus_ph_no || businessContact.phoneNumber),
          enc(businessContact.bus_email || businessContact.email),
          businessParticulars.start_date || null,
          businessType || null,
          businessAddId,
          mailingAddId,
          businessParticulars.role || null,
          businessParticulars.msic_code || null,
          businessParticulars.msic_name || null,
        ]
      );
    }

    const currentAccountRole =
      businessParticulars.role ||
      (isSoleProprietorship ? "Owner" : "Partner");

    const existingCurrentAccountUserRes = await client.query(
      `
      SELECT user_id
      FROM banka."Current_account_user"
      WHERE user_id = $1
        AND account_no = $2
      LIMIT 1
      `,
      [userId, accountNo]
    );

    if (existingCurrentAccountUserRes.rows.length === 0) {
      await client.query(
        `
        INSERT INTO banka."Current_account_user" (
          user_id,
          account_no,
          role
        )
        VALUES ($1, $2, $3)
        `,
        [
          userId,
          accountNo,
          currentAccountRole,
        ]
      );
    }

    if (!isAddAccountFlow && journeyId && scorecardResult !== null) {
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
    }

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

    try {
      if (customerEmail) {
        await sendAccountConfirmationEmail({
          to: customerEmail,
          fullName: customerFullName,
          accountType: "Malaysian Current Account",
          accountNo,
        });
      }
    } catch (emailError) {
      console.error("Confirmation email failed:", emailError);
    }

    return NextResponse.json(
      {
        message:
          "Malaysian corporate current account application created successfully",
        cust_id: custId,
        user_id: userId,
        account_no: accountNo,
      },
      { status: 201 }
    );
  } catch (error: any) {
    await client.query("ROLLBACK");

    console.error(
      "Malaysian current account deployment exception path hit:",
      error
    );

    return NextResponse.json(
      {
        error:
          error.message ||
          "Failed to create Malaysian corporate current account application",
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}