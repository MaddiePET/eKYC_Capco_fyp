import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { decrypt } from "@/lib/cryptoSecurity";

function parseAvatar(imgField: any): string {
  if (!imgField) return "";

  if (Buffer.isBuffer(imgField)) {
    const rawString = imgField.toString("utf-8").trim();

    if (
      rawString.startsWith("http://") ||
      rawString.startsWith("https://") ||
      rawString.startsWith("data:image/")
    ) {
      return rawString;
    }
    return `data:image/jpeg;base64,${imgField.toString("base64")}`;
  }

  if (typeof imgField === "string") {
    return imgField;
  }

  return "";
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { error: "Missing required username parameter" },
        { status: 400 }
      );
    }

    const query = `
      SELECT 
        u.user_id AS id,
        u.username,
        c.email,
        c.ph_no AS phone,
        u.img AS avatar,
        CASE 
          WHEN cau.account_no IS NOT NULL THEN 'Current Account'
          WHEN sa.account_no IS NOT NULL THEN 'Savings Account'
        END AS type,
        u.branch,
        CASE 
          WHEN LOWER(c.id_type) IN ('ic', 'mykad', 'nric', 'malaysian') THEN true 
          ELSE false 
        END AS "isMalaysian"
      FROM banka."User" u
      JOIN banka."Customer" c
        ON u.cust_id = c.cust_id
      LEFT JOIN banka."Current_account_user" cau
        ON u.user_id = cau.user_id
      LEFT JOIN banka."Savings_account" sa
        ON u.user_id = sa.user_id
      WHERE u.cust_id = (
        SELECT cust_id
        FROM banka."User"
        WHERE LOWER(username) = LOWER($1)
        LIMIT 1
      );
    `;

    const result = await pool.query(query, [username]);

    const accounts = result.rows.map((row) => {
      let resolvedAvatar = parseAvatar(row.avatar);
      
      if (!resolvedAvatar) {
        resolvedAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(row.username || "User")}`;
      }

      return {
        id: row.id,
        username: row.username,
        name: row.username,
        email: row.email ? decrypt(row.email, "banka") : "",
        phone: row.phone ? decrypt(row.phone, "banka") : "",
        avatar: resolvedAvatar,
        type: row.type,
        isMalaysian: row.isMalaysian,
      };
    });

    return NextResponse.json(accounts);
    
  } catch (error: any) {
    console.error("Error fetching user list details:", error);
    
    return NextResponse.json(
      { error: error.message || "Failed to fetch active accounts" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { cust_id, username, password, status, sec_phrase, branch, img } = body;

    if (!cust_id || !username || !password || !status || !sec_phrase || !branch) {
      return NextResponse.json(
        { error: "Missing required user fields." },
        { status: 400 }
      );
    }

    const query = `
      INSERT INTO banka."User" (cust_id, username, password, status, sec_phrase, branch, img)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;

    const values = [cust_id, username, password, status, sec_phrase, branch, img || null];
    const result = await pool.query(query, values);

    return NextResponse.json(
      { message: "User account created successfully", data: result.rows[0] },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create user" },
      { status: 500 }
    );
  }
}