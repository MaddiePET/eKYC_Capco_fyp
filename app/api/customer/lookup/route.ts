import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { decrypt, hashLookup } from "@/lib/cryptoSecurity";

function safeDecrypt(value: string | null | undefined) {
  if (!value) return "";

  const parts = String(value).split(":");

  if (parts.length !== 3) {
    return value;
  }

  const decrypted = decrypt(value, "banka");

  if (!decrypted || decrypted === "[DECRYPT_FAILED]") {
    return value;
  }

  return decrypted;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const custId = url.searchParams.get("cust_id");
    const idNum = url.searchParams.get("id_num");

    let result;

    if (custId) {
      result = await pool.query(
        `
        SELECT 
          c.cust_id,
          c.id_num,
          c.full_name,
          c.id_type,
          c.dob,
          c.gender,
          c.ph_no,
          c.email,
          a.add_1,
          a.add_2,
          a.postcode,
          a.state,
          a.country
        FROM banka."Customer" c
        LEFT JOIN banka."Address" a ON c.home_add = a.add_id
        WHERE c.cust_id = $1
        LIMIT 1
        `,
        [custId]
      );
    } else if (idNum) {
      const cleanIdNum = idNum.replace(/-/g, "").trim();
      const idNumHash = hashLookup(cleanIdNum);

      result = await pool.query(
        `
        SELECT 
          c.cust_id,
          c.id_num,
          c.full_name,
          c.id_type,
          c.dob,
          c.gender,
          c.ph_no,
          c.email,
          a.add_1,
          a.add_2,
          a.postcode,
          a.state,
          a.country
        FROM banka."Customer" c
        LEFT JOIN banka."Address" a ON c.home_add = a.add_id
        WHERE c.id_num_hash = $1
        LIMIT 1
        `,
        [idNumHash]
      );
    } else {
      return NextResponse.json(
        { success: false, message: "Missing cust_id or id_num" },
        { status: 400 }
      );
    }

    if (!result || result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Customer not found",
      });
    }

    const customer = result.rows[0];

    return NextResponse.json({
      success: true,
      customer: {
        cust_id: customer.cust_id,
        id_num: safeDecrypt(customer.id_num),
        full_name: safeDecrypt(customer.full_name),
        id_type: customer.id_type,
        dob: customer.dob,
        gender: customer.gender || "",
        ph_no: safeDecrypt(customer.ph_no),
        email: safeDecrypt(customer.email),
        add_1: safeDecrypt(customer.add_1),
        add_2: safeDecrypt(customer.add_2),
        postcode: safeDecrypt(customer.postcode),
        state: safeDecrypt(customer.state),
        country: safeDecrypt(customer.country) || "Malaysia",
      },
    });
  } catch (error: any) {
    console.error("Customer lookup error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to lookup customer",
      },
      { status: 500 }
    );
  }
}