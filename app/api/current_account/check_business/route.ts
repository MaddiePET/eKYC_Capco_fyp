import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { hashLookup } from "@/lib/cryptoSecurity";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const regNo = url.searchParams.get("reg_no");

    if (!regNo) {
      return NextResponse.json(
        { success: false, message: "Missing reg_no" },
        { status: 400 }
      );
    }

    const regNoHash = hashLookup(regNo);

    const result = await pool.query(
      `
      SELECT 
        account_no,
        bus_type
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
      });
    }

    return NextResponse.json({
      success: true,
      exists: true,
      account_no: result.rows[0].account_no,
      bus_type: result.rows[0].bus_type,
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