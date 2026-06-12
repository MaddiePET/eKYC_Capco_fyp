import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { decrypt } from "@/lib/cryptoSecurity";

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
        c.full_name,
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

    let avatarString = "";

    if (user.img) {
      if (Buffer.isBuffer(user.img)) {
        const content = user.img.toString();
        
        avatarString = content.startsWith("http")
          ? content
          : `data:image/jpeg;base64,${user.img.toString("base64")}`;
      } else if (typeof user.img === "string") {
        avatarString = user.img;
      }
    }

    const fullName = user.full_name ? decrypt(user.full_name, "banka") : "";
    const email = user.email ? decrypt(user.email, "banka") : "";

    return NextResponse.json({
      username: user.username,
      name: fullName,
      email,
      avatar: avatarString,
      securityPhrase: user.sec_phrase,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}