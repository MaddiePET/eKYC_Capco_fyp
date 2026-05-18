import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(
  req: Request,
  context: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await context.params;
    console.log("PROFILE QUERY USERNAME:", username);

    const query = `
      SELECT
        u.username,
        u.img,
        c.full_name,
        c.ph_no,
        c.email,
        sa.occupation,
        a.add_1,
        a.add_2,
        a.postcode,
        a.state,
        a.country
      FROM banka."User" AS u
      JOIN banka."Customer" AS c
        ON u.cust_id = c.cust_id
      LEFT JOIN banka."Savings_account" AS sa
        ON u.user_id = sa.user_id
      LEFT JOIN banka."Address" AS a
        ON c.home_add = a.add_id
      WHERE LOWER(u.username) = LOWER($1)
    `;

    const result = await pool.query(query, [username]);

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

    return NextResponse.json({
      username: user.username,
      name: user.full_name || "",
      fullName: user.full_name || "",
      email: user.email || "",
      avatar: avatarString,
      phone: user.ph_no_1 || "",
      occupation: user.occupation || "",
      country: user.country || "",
      cityState: user.state || "",
      postalCode: user.postcode || "",
      address: [user.add_1, user.add_2].filter(Boolean).join(", "),
      location: [user.state, user.country].filter(Boolean).join(", "),
    });
  } catch (err) {
    console.error("PROFILE ROUTE ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}