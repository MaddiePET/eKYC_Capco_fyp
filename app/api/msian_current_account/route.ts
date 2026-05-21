import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { hashPassword } from "@/hashpw";
import { encrypt, hashLookup } from "@/lib/cryptoSecurity";

export const runtime = "nodejs";

// Generates a random 16 digit current account number
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
  return value ? hashLookup(String(value).replace(/-/g, "").trim().toUpperCase()) : null;
}

export async function POST(req: Request) {
  const client = await pool.connect();

  try {
    const data = await req.json();
    
    // Extract primary payload context structures
    const personalInfo = data.personalInfo || {};
    const contactInfo = data.contactInfo || {};
    const businessContact = data.businessContact || {};
    const businessParticulars = data.businessParticulars || {};
    const businessAddressData = data.businessAddress || {};
    const account = data.account || {};
    const phoneVerification = data.phoneVerification || {};

    const customerIdNum = personalInfo.id_num || personalInfo.idNumber || personalInfo.ic_num;
    const customerFullName = personalInfo.fullName || personalInfo.full_name;

    if (!customerIdNum || !customerFullName || !personalInfo.dob) {
      console.error("🚨 Backend Validation Blocked - Payload Mismatch Dump:", {
        extractedId: customerIdNum,
        extractedName: customerFullName,
        extractedDob: personalInfo.dob
      });
      return NextResponse.json(
        { error: "Customer identification numbers, full name, and date of birth are required fields." },
        { status: 400 }
      );
    }

    // Begin Database Transaction Sequence
    await client.query("BEGIN");

    // 1. Map and isolate safe default strings for personal residential home addresses
    const personalAddress = {
      add_1: personalInfo.add_1 || personalInfo.streetAddress || personalInfo.add1 || "",
      add_2: personalInfo.add_2 || personalInfo.city || personalInfo.add2 || "",
      postcode: personalInfo.postcode || personalInfo.postal || "",
      state: personalInfo.state || "",
      country: personalInfo.country || "Malaysia",
    };

    if (!personalAddress.add_1) {
      throw new Error("Personal residential address Line 1 parameter is empty.");
    }

    const homeAddressRes = await client.query(
      `
      INSERT INTO banka."Address" (add_1, add_2, postcode, state, country)
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

    const homeAddId = homeAddressRes.rows[0].add_id;

    // 2. Perform Account Multi-Linking check using identity hash
    const cleanIdNum = String(customerIdNum).replace(/-/g, "").trim().toUpperCase();
    const identityLookupHash = hashLookup(cleanIdNum);

    const existingCustomerCheck = await client.query(
      `SELECT cust_id FROM banka."Customer" WHERE id_num_hash = $1`,
      [identityLookupHash]
    );

    let custId: number;

    if (existingCustomerCheck.rows.length > 0) {
      custId = existingCustomerCheck.rows[0].cust_id;
      console.log(`[CURRENT ACCOUNT] Existing profile found. Linking current account to master cust_id: ${custId}`);
    } else {
      const customerRes = await client.query(
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
          identityLookupHash,
          enc(cleanIdNum),
          enc(customerFullName),
          personalInfo.id_type || "IC",
          personalInfo.dob,
          enc(phoneVerification.phoneNumber || personalInfo.ph_no_1 || personalInfo.ph_no),
          enc(contactInfo.email || personalInfo.email),
          homeAddId,
        ]
      );
      custId = customerRes.rows[0].cust_id;
    }

    // 3. Username uniqueness validation check before insertion
    const targetUsername = account.username;
    if (!targetUsername) throw new Error("Account registration username parameter is empty.");

    const usernameCheck = await client.query(
      `SELECT user_id FROM banka."User" WHERE LOWER(username) = LOWER($1)`,
      [targetUsername]
    );

    if (usernameCheck.rows.length > 0) {
      return NextResponse.json(
        { error: "This user profile identifier username is already registered." },
        { status: 400 }
      );
    }

    const rawPassword = account.password;
    if (!rawPassword) throw new Error("Account secure profile validation password parameter is missing.");

    const hashedPassword = await hashPassword(rawPassword);

    // Sanitize uploaded system visual image attachment streams
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
        targetUsername,
        hashedPassword,
        "PENDING",
        profileBuffer,
        account.securityPhrase || "",
        businessAddressData.preferredBranch || "Main Corporate Branch",
      ]
    );
    const userId = userRes.rows[0].user_id;

    // 4. Map corporate operational commercial business addresses
    const businessAddress = {
      add_1: businessAddressData.businessAddress?.addressLine1 || businessAddressData.addressLine1 || "",
      add_2: businessAddressData.businessAddress?.addressLine2 || businessAddressData.addressLine2 || "",
      postcode: businessAddressData.businessAddress?.postcode || businessAddressData.postcode || "",
      state: businessAddressData.businessAddress?.state || businessAddressData.state || "",
      country: businessAddressData.businessAddress?.country || businessAddressData.country || "Malaysia",
    };

    if (!businessAddress.add_1) throw new Error("Corporate operational business address Line 1 is empty.");

    const businessAddressRes = await client.query(
      `
      INSERT INTO banka."Address" (add_1, add_2, postcode, state, country)
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

    const businessAddId = businessAddressRes.rows[0].add_id;
    let mailingAddId = businessAddId;

    const isMailingSameAsBusiness = businessAddressData.isMailingSameAsBusiness ?? true;

    if (!isMailingSameAsBusiness && businessAddressData.mailingAddress) {
      const mailingAddress = {
        add_1: businessAddressData.mailingAddress.addressLine1 || "",
        add_2: businessAddressData.mailingAddress.addressLine2 || "",
        postcode: businessAddressData.mailingAddress.postcode || "",
        state: businessAddressData.mailingAddress.state || "",
        country: businessAddressData.mailingAddress.country || "Malaysia",
      };

      const mailingAddressRes = await client.query(
        `
        INSERT INTO banka."Address" (add_1, add_2, postcode, state, country)
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

    // 5. Generate a unique non-conflicting 16 digit current account number
    let accountNo = generateAccountNumber();
    let accountExists = true;

    while (accountExists) {
      const checkAccount = await client.query(
        `SELECT account_no FROM banka."Current_account" WHERE account_no = $1`,
        [accountNo]
      );

      if (checkAccount.rows.length === 0) {
        accountExists = false;
      } else {
        accountNo = generateAccountNumber();
      }
    }

    // 6. Write record parameters directly to the master Current Account layout table
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
        hash(businessParticulars.registration_number || businessParticulars.reg_no),
        enc(businessParticulars.registration_number || businessParticulars.reg_no),
        enc(businessParticulars.business_name || businessParticulars.bus_name),
        enc(businessContact.bus_ph_no || businessContact.phoneNumber),
        enc(businessContact.bus_email || businessContact.email),
        businessParticulars.start_date || null,
        businessParticulars.business_type || businessParticulars.bus_type || null,
        businessAddId,
        mailingAddId,
        businessParticulars.role || null,
        businessParticulars.msic_code || null,
        businessParticulars.msic_name || null,
      ]
    );

    await client.query("COMMIT");

    return NextResponse.json(
      {
        message: "Malaysian corporate current account application created successfully",
        cust_id: custId,
        user_id: userId,
        account_no: accountNo,
      },
      { status: 201 }
    );
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("Malaysian current account deployment exception path hit:", error);

    return NextResponse.json(
      { error: error.message || "Failed to create Malaysian corporate current account application" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}