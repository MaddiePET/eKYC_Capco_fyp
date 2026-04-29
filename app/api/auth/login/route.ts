import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    const query = `
      SELECT 
        u.username,
        u.password,
        c.full_name
      FROM banka."User" AS u
      JOIN banka."Customer" AS c ON u.cust_id = c.cust_id
      WHERE LOWER(u.username) = LOWER($1)
    `;

    console.log("USERNAME:", username);

    const result = await pool.query(query, [username]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const user = result.rows[0];

    if (!user.password || typeof user.password !== "string") {
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    return NextResponse.json({
      username: user.username,
      name: `${user.full_name}`,
    });
  } catch (err) {
    console.error("LOGIN ROUTE ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}