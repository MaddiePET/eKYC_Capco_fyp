import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import bcrypt from "bcrypt";
import { decrypt } from "@/lib/cryptoSecurity";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
    }

    const query = `
      SELECT 
        u.username,
        u.password,
        u.img,
        c.full_name,
        c.email
      FROM banka."User" AS u
      JOIN banka."Customer" AS c ON u.cust_id = c.cust_id
      WHERE LOWER(u.username) = LOWER($1)
    `;

    console.log("PROBING AUTHENTICATION SUITE FOR USERNAME:", username);
    const result = await pool.query(query, [username]);

    if (result.rows.length === 0) {
      console.log(`[AUTH FAILED] Username not found in DB: ${username}`);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const user = result.rows[0];

    if (!user.password || typeof user.password !== "string") {
      return NextResponse.json({ error: "Server password configuration error" }, { status: 500 });
    }

    // Diagnostic Check: Verify password comparison match output
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`[AUTH DIAGNOSTIC] BCrypt evaluation result for ${username}:`, isMatch);

    if (!isMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Decrypt user identity attributes with fallbacks
    let plainName = "";
    let plainEmail = "";

    try {
      plainName = user.full_name ? decrypt(user.full_name, "banka") : "";
    } catch (err) {
      console.warn("[DECRYPT WARN] Failed to decrypt full_name, returning raw string.");
      plainName = user.full_name || "";
    }

    try {
      plainEmail = user.email ? decrypt(user.email, "banka") : "";
    } catch (err) {
      console.warn("[DECRYPT WARN] Failed to decrypt email, returning raw string.");
      plainEmail = user.email || "";
    }

    // Normalize user image attachment byte buffers
    let avatarBase64 = "";
    if (user.img && Buffer.isBuffer(user.img)) {
      avatarBase64 = `data:image/jpeg;base64,${user.img.toString("base64")}`;
    } else if (typeof user.img === "string") {
      avatarBase64 = user.img;
    }

    if (!avatarBase64) {
      avatarBase64 = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(plainName || "User")}`;
    }

    return NextResponse.json({
      username: user.username,
      name: plainName,
      email: plainEmail,
      avatar: avatarBase64,
    });

  } catch (err) {
    console.error("CRITICAL EXCEPTION IN LOGIN HANDLER:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}