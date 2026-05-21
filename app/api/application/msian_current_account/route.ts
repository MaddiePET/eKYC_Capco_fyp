import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { hashPassword } from "@/hashpw";
import { encrypt, hashLookup } from "@/lib/cryptoSecurity";

// Generates a random 16 digit savings account number
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
  const data = await req.json();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    console.log("FULL SUBMIT DATA:", JSON.stringify(data, null, 2));
    console.log("personalInfo:", data.personalInfo);
    console.log("contactInfo:", data.contactInfo);
    console.log("businessContact:", data.businessContact?.bus_email);
    console.log("businessAddress section:", data.businessAddress);
    console.log("businessAddress.businessAddress:", data.businessAddress?.businessAddress);
    console.log("businessAddress.mailingAddress:", data.businessAddress?.mailingAddress);
    console.log("business details:", data.businessParticulars);

    const personalInfo = data.personalInfo || {};
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

      state:
        personalInfo.state ||
        "",

      country:
        personalInfo.country ||
        "Malaysia",
    };

    if (!personalAddress.add_1) throw new Error("Personal address line 1 is missing");

    const homeAddressRes = await client.query(
      `
      INSERT INTO banka."Address" (
        add_1, add_2, postcode, state, country
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING add_id
      `,
      [
        enc(personalInfo.streetAddress || personalInfo.add_1),
        enc(personalInfo.city || personalInfo.add_2),
        enc(personalInfo.postal || personalInfo.postcode),
        enc(personalInfo.state),
        enc(personalInfo.country || "Malaysia"),
      ]
    );

    const homeAddId = homeAddressRes.rows[0].add_id;

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
        data.personalInfo?.id_num || personalInfo.idNumber,
        data.personalInfo?.fullName || personalInfo.full_name,
        "IC",
        data.personalInfo?.dob || personalInfo.date_of_birth ,
        data.phoneVerification?.phoneNumber || personalInfo.ph_no_1,
        data.contactInfo?.email || personalInfo.email ,
        home_add,
      ]
    );

    const custId = customerRes.rows[0].cust_id;

    const rawPassword = account.password;
    if (!rawPassword) throw new Error("Password is missing");

    const hashedPassword = await hashPassword(rawPassword);

    let profileBuffer: Buffer | string | null = null;
    if (account.profilePreview || account.img) {
      const img = account.profilePreview || account.img;
      profileBuffer = img.startsWith("data:image")
        ? Buffer.from(img.split(",")[1], "base64")
        : Buffer.from(img);
    }

    const userRes = await client.query(
      `
      INSERT INTO banka."User" (
        cust_id,
        username,
        password,
        status,
        sec_phrase,
        branch,
        img
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING user_id
      `,
      [
        cust_id,
        data.account?.username || null,
        hashedPassword || null,
        "PENDING",
        profileBuffer || null,
        data.account?.securityPhrase || null,
        data.businessAddress?.preferredBranch || null,
      ]
    );
    const user_id = userRes.rows[0].user_id;

    const businessAddress = {
      add_1:
        data.businessAddress?.businessAddress?.addressLine1 ||
        data.businessAddress?.addressLine1 || "",
      add_2:
        data.businessAddress?.businessAddress?.addressLine2 ||
        data.businessAddress?.addressLine2 || "",
      postcode:
        data.businessAddress?.businessAddress?.postcode ||
        data.businessAddress?.postcode || "",
      state:
        data.businessAddress?.businessAddress?.state ||
        data.businessAddress?.state || "",
      country:
        data.businessAddress?.businessAddress?.country ||
        data.businessAddress?.country || "Malaysia",
    };
    if (!businessAddress.add_1) throw new Error("Business address line 1 is missing");

    const mailingAddress = {
      add_1: data.businessAddress?.mailingAddress?.addressLine1 || "",
      add_2: data.businessAddress?.mailingAddress?.addressLine2 || "",
      postcode: data.businessAddress?.mailingAddress?.postcode || "",
      state: data.businessAddress?.mailingAddress?.state || "",
      country: data.businessAddress?.mailingAddress?.country || "Malaysia",
    };
    const isMailingSameAsBusiness = data.businessAddress?.isMailingSameAsBusiness ?? true;

    const businessAddressRes = await client.query(
      `
      INSERT INTO banka."Address" (
        add_1, add_2, postcode, state, country
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING add_id
      `,
      [
        enc(businessAddress.add_1 || businessAddress.streetAddress1),
        enc(businessAddress.add_2 || businessAddress.streetAddress2 || businessAddress.city),
        enc(businessAddress.postcode || businessAddress.postal),
        enc(businessAddress.state),
        enc(businessAddress.country || "Malaysia"),
      ]
    );

    const businessAddId = businessAddressRes.rows[0].add_id;

    let mail_add_id = bus_add_id;
    if (!isMailingSameAsBusiness) {
      const mailingAddressRes = await client.query(
        `
        INSERT INTO banka."Address" (
          add_1, 
          add_2, 
          postcode, 
          state, 
          country
        )
        VALUES ($1,$2,$3,$4,$5)
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
      mail_add_id = mailingAddressRes.rows[0].add_id;
    }

    // 7. Generate a unique 16 digit current account number
    let accountNo = generateAccountNumber();
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

    const currentAccountRes = await client.query(
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
      RETURNING account_no
      `,
      [
        accountNo,
        userId,
        hash(businessParticulars.reg_no),
        enc(businessParticulars.reg_no),
        enc(businessParticulars.bus_name),
        enc(businessContact.bus_ph_no),
        enc(businessContact.bus_email),
        businessParticulars.start_date || null,
        businessParticulars.bus_type || null,
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
        message: "Malaysian current account application created successfully",
        cust_id: custId,
        user_id: userId,
        account_no: currentAccountRes.rows[0].account_no,
      },
      { status: 201 }
    );
  } catch (error: any) {
    await client.query("ROLLBACK");

    console.error("Malaysian current account error:", error);

    return NextResponse.json(
      {
        error:
          error.message ||
          "Failed to create Malaysian current account application",
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}