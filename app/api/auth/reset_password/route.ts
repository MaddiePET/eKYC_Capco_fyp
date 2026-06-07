import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { hashPassword } from "@/scripts/hashpw";
import { hashLookup } from "@/lib/cryptoSecurity";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const client = await pool.connect();

  try {
    const { action, username, idNumber, newPassword } = await req.json();

    if (!username) {
      return NextResponse.json({ error: "Username is required." }, { status: 400 });
    }

    await client.query("BEGIN");

    const userResult = await client.query(
      `SELECT u.user_id, c.id_num_hash 
      FROM banka."User" u
      JOIN banka."Customer" c ON u.cust_id = c.cust_id
      WHERE LOWER(u.username) = LOWER($1)`,
      [username]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "Username and/or MyKad/Passport number not found. Please try again." }, { status: 400 });
    }

    const user = userResult.rows[0];

    if (action === "verify") {
      if (!idNumber) {
        return NextResponse.json({ error: "MyKad/Passport Number is required." }, { status: 400 });
      }

      const cleanIdNum = String(idNumber).replace(/[-\s]/g, "").toUpperCase();
      const inputIdHash = hashLookup(cleanIdNum);

      if (user.id_num_hash !== inputIdHash) {
        return NextResponse.json({ error: "Username and/or MyKad/Passport number not found. Please try again." }, { status: 400 });
      }

      return NextResponse.json({ message: "Identity verified successfully." }, { status: 200 });
    }

    if (action === "reset") {
      if (!newPassword) {
        return NextResponse.json({ error: "New password is required." }, { status: 400 });
      }

      const hashedPassword = await hashPassword(newPassword);

      await client.query(
        `UPDATE banka."User" 
        SET password = $1 
        WHERE LOWER(username) = LOWER($2)`,
        [hashedPassword, username]
      );

      await client.query("COMMIT");
      return NextResponse.json({ message: "Password updated successfully." }, { status: 200 });
    }
    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}