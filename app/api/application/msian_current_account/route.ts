import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

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

    const personalAddress = {
      add_1: data.personalInfo?.streetAddress || "",
      add_2: data.personalInfo?.city || "",
      postcode: data.personalInfo?.postal || "",
      state: data.personalInfo?.state || "",
      country: data.personalInfo?.country || "Malaysia",
    };

    if (!personalAddress.add_1) {
      throw new Error("Personal address line 1 is missing");
    }
    // 1. Insert personal/home address first
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
        data.personalInfo?.streetAddress || null,
        data.personalInfo?.city || null,
        data.personalInfo?.postal || null,
        data.personalInfo?.state || null,
        data.personalInfo?.country || "Malaysia",
      ]
    );

    const home_add = homeAddressRes.rows[0].add_id;

    // 2. Insert Customer using home_add FK
    const customerRes = await client.query(
      `
      INSERT INTO banka."Customer" (
        id_num,
        full_name,
        id_type,
        dob,
        ph_no_1,
        ph_no_2,
        email,
        home_add
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING cust_id
      `,
      [
        data.personalInfo?.id_num || null,
        data.personalInfo?.fullName || null,
        "IC",
        data.personalInfo?.dob || null,
        data.phoneVerification?.ph_no_1 || null,
        data.phoneVerification?.ph_no_2 || "-", 
        data.contactInfo?.email || null,
        home_add,
      ]
    );

    const cust_id = customerRes.rows[0].cust_id;

    // 3. Insert User
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
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING user_id
      `,
      [
        cust_id,
        data.account?.username || null,
        data.account?.password || null,
        "PENDING",
        data.account?.profilePreview || null,
        data.account?.securityPhrase || null,
        data.businessAddress?.preferredBranch || null,
      ]
    );

    const user_id = userRes.rows[0].user_id;

    // 4. Insert business address

    const businessAddress = {
      add_1:
        data.businessAddress?.businessAddress?.streetAddress ||
        data.businessAddress?.streetAddress ||
        "",
      add_2:
        data.businessAddress?.businessAddress?.city ||
        data.businessAddress?.city ||
        "",
      postcode:
        data.businessAddress?.businessAddress?.postal ||
        data.businessAddress?.postal ||
        "",
      state:
        data.businessAddress?.businessAddress?.state ||
        data.businessAddress?.state ||
        "",
      country:
        data.businessAddress?.businessAddress?.country ||
        data.businessAddress?.country ||
        "Malaysia",
    };

    if (!businessAddress.add_1) {
      throw new Error("Business address line 1 is missing");
    }

    const mailingAddress = {
      add_1:
        data.businessAddress?.mailingAddress?.streetAddress ||
        "",
      add_2:
        data.businessAddress?.mailingAddress?.city ||
        "",
      postcode:
        data.businessAddress?.mailingAddress?.postal ||
        "",
      state:
        data.businessAddress?.mailingAddress?.state ||
        "",
      country:
        data.businessAddress?.mailingAddress?.country ||
        "Malaysia",
    };
    const isMailingSameAsBusiness =
      data.businessAddress?.isMailingSameAsBusiness ?? true;

    const businessAddressRes = await client.query(
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
        businessAddress.add_1,
        businessAddress.add_2,
        businessAddress.postcode,
        businessAddress.state,
        businessAddress.country,
      ]
    );

    const bus_add_id = businessAddressRes.rows[0].add_id;

    // 5. Insert mailing address only if different
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

    // 6. Insert Current_account
    await client.query(
      `
      INSERT INTO banka."Current_account" (
        user_id,
        reg_no,
        bus_name,
        bus_type,
        role,
        bus_ph_no,
        bus_email,
        start_date,
        bus_add_id,
        mail_add_id
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      `,
      [
        user_id,
        data.businessParticulars?.brn || data.businessParticulars?.reg_no || null,
        data.businessParticulars?.businessName || data.businessParticulars?.bus_name || null,
        data.businessParticulars?.businessType || data.businessParticulars?.bus_type || null,
        data.businessParticulars?.role || "notyet",
        data.businessContact?.bus_ph_no || null,
        data.businessContact?.bus_email || null,
        data.businessParticulars?.startDate || null,
        bus_add_id,
        mail_add_id,
      ]
    );

    // 7. Insert supporting documents
    const supportingDocs = data.supportingDocuments || [];

    for (const doc of supportingDocs) {
      if (!doc?.name || !doc?.fileBase64) continue;

      const base64Part = doc.fileBase64.includes(",")
        ? doc.fileBase64.split(",")[1]
        : doc.fileBase64;

      const fileBuffer = Buffer.from(base64Part, "base64");

      await client.query(
        `
        INSERT INTO banka."Business_supporting_docs" (
          user_id,
          doc_name,
          doc_file
        )
        VALUES ($1,$2,$3)
        `,
        [user_id, doc.name, fileBuffer]
      );
    }

    await client.query("COMMIT");

    return NextResponse.json({
      message: "Success",
      cust_id,
      user_id,
      home_add,
      bus_add_id,
      mail_add_id,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Application submit error:", err);

    return NextResponse.json(
      {
        error: "Failed",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}