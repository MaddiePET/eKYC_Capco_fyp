import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { hashLookup } from "@/lib/cryptoSecurity";

function normalize(value: string) {
  return String(value || "")
    .replace(/-/g, "")
    .trim()
    .toUpperCase();
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const regNo = url.searchParams.get("reg_no") || "";
    const idNum = url.searchParams.get("id_num") || "";

    if (!regNo) {
      return NextResponse.json(
        { success: false, message: "Missing reg_no" },
        { status: 400 }
      );
    }

    const regNoHash = hashLookup(normalize(regNo));
    console.log("===== CHECK BUSINESS API =====");
    console.log("INPUT REG NO:", regNo);
    console.log("NORMALIZED REG NO:", normalize(regNo));
    console.log("REG NO HASH:", regNoHash);

    const result = await pool.query(
      `
      SELECT 
        account_no,
        user_id,
        bus_type,
        reg_no_hash
      FROM banka."Current_account"
      WHERE reg_no_hash = $1
      LIMIT 1
      `,
      [regNoHash]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: true,
        exists: false,
        account_no: "",
        bus_type: "",
        same_customer_linked: false,
      });
    }

    const accountNo = result.rows[0].account_no;
    const currentAccountUserId = result.rows[0].user_id;
    const busType = result.rows[0].bus_type;

    let sameCustomerLinked = false;

    if (idNum) {
      const idNumHash = hashLookup(normalize(idNum));

      const sameCustomerResult = await pool.query(
        `
        SELECT 1
        FROM banka."Customer" AS c
        JOIN banka."User" AS u
          ON u.cust_id = c.cust_id
        WHERE c.id_num_hash = $1
          AND (
            u.user_id = $2
            OR EXISTS (
              SELECT 1
              FROM banka."Current_account_user" AS cau
              WHERE cau.user_id = u.user_id
                AND cau.account_no = $3
            )
          )
        LIMIT 1
        `,
        [idNumHash, currentAccountUserId, accountNo]
      );
      console.log("MATCHED CURRENT ACCOUNT ROWS:", result.rows);


      sameCustomerLinked = sameCustomerResult.rows.length > 0;
    }

    return NextResponse.json({
      success: true,
      exists: true,
      account_no: accountNo,
      bus_type: busType,
      same_customer_linked: sameCustomerLinked,
    });
  } catch (error: any) {
    console.error("Check current account business error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to check business account",
      },
      { status: 500 }
    );
  }
}