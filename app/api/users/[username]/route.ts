import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(
  req: Request,
  context: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await context.params; 

    console.log("USERNAME:", username);

    const result = await pool.query(
      `
      SELECT 
        u.user_id,
        u.username,
        u.img,
        u.sec_phrase,
        c.cust_id,
        c.fname,
        c.lname,
        c.email
      FROM banka."User" u
      JOIN banka."Customer" c ON u.cust_id = c.cust_id
      WHERE LOWER(u.username) = LOWER($1)
      `,
      [username]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = result.rows[0];

    return NextResponse.json({
      username: user.username,
      name: `${user.fname} ${user.lname}`,
      email: user.email,
      avatar: user.img || "/images/user/default.jpg",
      securityPhrase: user.sec_phrase,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}