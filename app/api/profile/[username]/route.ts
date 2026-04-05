import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(
  req: Request,
  context: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await context.params;

    const query = `
      SELECT
        u.username,
        u.img,
        c.fname,
        c.lname,
        c.ph_no_1,
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
        ON sa.add_id = a.add_id
      WHERE LOWER(u.username) = LOWER($1)
    `;

    console.log("PROFILE QUERY USERNAME:", username);

    const result = await pool.query(query, [username]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = result.rows[0];

    return NextResponse.json({
      username: user.username,
      name: `${user.fname} ${user.lname}`,
      firstName: user.fname,
      lastName: user.lname,
      email: user.email,
      avatar: user.img || "/images/user/default.jpg",
      phone: user.ph_no_1,
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