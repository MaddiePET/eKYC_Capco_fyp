import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { error: "Username parameter is required" },
        { status: 400 }
      );
    }

    const res = await pool.query(
      `SELECT user_id FROM banka."User" WHERE LOWER(username) = LOWER($1)`,
      [username.trim()]
    );

    const exists = res.rows.length > 0;

    return NextResponse.json({ exists });
  } catch (error: any) {
    console.error("Error checking username availability:", error);
    return NextResponse.json(
      { error: "Internal database query exception" },
      { status: 500 }
    );
  }
}