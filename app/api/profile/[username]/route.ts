import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { decrypt } from "@/lib/cryptoSecurity";

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
        u.user_id,
        u.cust_id,
        u.img,
        c.full_name,
        c.ph_no,
        c.email,
        c.id_num,
        sa.occupation,
        sa.account_no AS savings_account_no,
        COALESCE(ca.account_no, cau.account_no) AS current_account_no,
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
      LEFT JOIN banka."Current_account_user" AS cau
        ON u.user_id = cau.user_id
      LEFT JOIN banka."Current_account" AS ca
        ON cau.account_no = ca.account_no
      LEFT JOIN banka."Address" AS a
        ON c.home_add = a.add_id
      WHERE LOWER(u.username) = LOWER($1)
    `;

    const result = await pool.query(query, [username]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = result.rows[0];

    let plainFullName = "";
    let plainPhone = "";
    let plainEmail = "";

    try {
      plainFullName = user.full_name ? decrypt(user.full_name, "banka") : "";
    } catch {
      plainFullName = user.full_name || "";
    }

    try {
      plainPhone = user.ph_no ? decrypt(user.ph_no, "banka") : "";
    } catch {
      plainPhone = user.ph_no || "";
    }

    try {
      plainEmail = user.email ? decrypt(user.email, "banka") : "";
    } catch {
      plainEmail = user.email || "";
    }

    let plainIdNum = "";

    try {
      plainIdNum = user.id_num ? decrypt(user.id_num, "banka") : "";
    } catch {
      plainIdNum = "";
    }

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

    if (!avatarString) {
      avatarString = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(plainFullName || "User")}`;
    }

    const accountNo = user.savings_account_no || user.current_account_no || "N/A";

    return NextResponse.json({
      user_id: user.user_id,
      cust_id: user.cust_id,
      username: user.username,
      id_num: plainIdNum,
      name: plainFullName,
      fullName: plainFullName,
      email: plainEmail,
      avatar: avatarString,
      phone: plainPhone,
      occupation: user.occupation || "",
      country: user.country || "",
      cityState: user.state || "",
      postalCode: user.postcode || "",
      address: [user.add_1, user.add_2].filter(Boolean).join(", "),
      location: [user.state, user.country].filter(Boolean).join(", "),
      accountNo: accountNo,
    });
  } catch (err) {
    console.error("PROFILE ROUTE ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}