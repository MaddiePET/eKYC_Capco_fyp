import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { decrypt } from "@/lib/cryptoSecurity";

function safeDecrypt(value: string | null | undefined) {
  if (!value) return "";

  const parts = String(value).split(":");

  if (parts.length !== 3) {
    return value;
  }

  try {
    const decrypted = decrypt(value, "banka");

    if (!decrypted || decrypted === "[DECRYPT_FAILED]") {
      return value;
    }

    return decrypted;
  } catch {
    return value;
  }
}

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

        cau.account_no AS linked_current_account_no,
        cau.role AS current_role,

        ca.account_no AS current_account_no,
        ca.bus_name,
        ca.reg_no,
        ca.bus_type,

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
      LIMIT 1
    `;

    const result = await pool.query(query, [username]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const user = result.rows[0];

    const plainFullName = safeDecrypt(user.full_name);
    const plainPhone = safeDecrypt(user.ph_no);
    const plainEmail = safeDecrypt(user.email);
    const plainIdNum = safeDecrypt(user.id_num);

    const plainAdd1 = safeDecrypt(user.add_1);
    const plainAdd2 = safeDecrypt(user.add_2);
    const plainPostcode = safeDecrypt(user.postcode);
    const plainState = safeDecrypt(user.state);
    const plainCountry = safeDecrypt(user.country);

    const plainBusinessName = safeDecrypt(user.bus_name);
    const plainRegNo = safeDecrypt(user.reg_no);

    let finalAddress2 = plainAdd2;
    let finalCity = "";

    if (plainAdd2 && plainAdd2.includes(", ")) {
      const parts = plainAdd2.split(", ");
      finalCity = parts.pop() || "";
      finalAddress2 = parts.join(", ");
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
      avatarString = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        plainFullName || "User"
      )}`;
    }

    const isCurrentAccount = !!(
      user.current_account_no || user.linked_current_account_no
    );

    const isSavingsAccount = !!user.savings_account_no;

    const accountNo =
      user.current_account_no ||
      user.linked_current_account_no ||
      user.savings_account_no ||
      "N/A";

    const accountType = isCurrentAccount
      ? "Current Account"
      : isSavingsAccount
      ? "Savings Account"
      : "Unknown";

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

      occupation: isCurrentAccount ? "" : user.occupation || "",

      country: plainCountry,
      city: finalCity,
      cityState: [finalCity, plainState].filter(Boolean).join(", "),
      postalCode: plainPostcode,
      address1: plainAdd1,
      address2: finalAddress2,
      address: [plainAdd1, finalAddress2].filter(Boolean).join(", "),
      location: [plainState, plainCountry].filter(Boolean).join(", "),

      accountNo,
      accountNumber: accountNo,
      account_no: accountNo,
      account_number: accountNo,

      accountType,
      account_type: accountType,
      type: accountType,

      businessName: plainBusinessName,
      business_name: plainBusinessName,
      bus_name: plainBusinessName,

      registrationNumber: plainRegNo,
      registration_number: plainRegNo,
      regNo: plainRegNo,
      reg_no: plainRegNo,
      brn: plainRegNo,

      businessType: user.bus_type || "",
      business_type: user.bus_type || "",
      bus_type: user.bus_type || "",

      role: user.current_role || "",
    });
  } catch (err) {
    console.error("PROFILE ROUTE ERROR:", err);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}