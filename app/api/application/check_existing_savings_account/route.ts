import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { hashLookup } from "@/lib/cryptoSecurity";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const client = await pool.connect();

  try {
    const body = await req.json();
    const idNum = body.id_num;

    if (!idNum) {
      return NextResponse.json(
        { error: "Missing MyKad or Passport number." },
        { status: 400 }
      );
    }

    const normalizedIdNum = String(idNum)
      .replace(/-/g, "")
      .replace(/\s/g, "")
      .toUpperCase()
      .trim();

    const idNumHash = hashLookup(normalizedIdNum);

    const existingCustomerResult = await client.query(
      `
      SELECT cust_id
      FROM banka."Customer"
      WHERE id_num_hash = $1
      `,
      [idNumHash]
    );

    if (existingCustomerResult.rows.length === 0) {
      return NextResponse.json({
        exists: false,
        hasSavingsAccount: false,
      });
    }

    const custId = existingCustomerResult.rows[0].cust_id;

    const existingAccountsResult = await client.query(
      `
      SELECT 
        EXISTS(SELECT 1 FROM banka."Savings_account" s JOIN banka."User" u ON s.user_id = u.user_id WHERE u.cust_id = $1) as has_savings,
        EXISTS(SELECT 1 FROM banka."Current_account" c JOIN banka."User" u ON c.user_id = u.user_id WHERE u.cust_id = $1) as has_current
      `,
      [custId]
    );

    const { has_savings, has_current } = existingAccountsResult.rows[0];

    if (has_savings) {
      return NextResponse.json(
        {
          exists: true,
          hasSavingsAccount: true,
          error: "This MyKad/Passport number is already registered for a savings account. Please log in to continue.",
          redirectTo: "/login",
        },
        { status: 409 }
      );
    }

    if (has_current) {
      return NextResponse.json(
        {
          exists: true,
          hasCurrentAccount: true,
          error: "You already have an existing current account. Please log in to your dashboard to add a savings account.",
          redirectTo: "/login",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      exists: true,
      hasSavingsAccount: false,
    });
  } catch (error: any) {
    console.error("Existing savings check error:", error);

    return NextResponse.json(
      { error: error.message || "Failed to check existing savings account." },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}