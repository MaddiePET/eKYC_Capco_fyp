import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

import { decrypt } from "@/lib/cryptoSecurity";

// Fetch Accounts for Dashboard Context
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

    // Query your PostgreSQL database using your pool client
    const query = `
      SELECT 
        u.user_id AS id,
        u.username,
        c.email,
        c.ph_no AS phone,
        u.img AS avatar,
        CASE 
          WHEN ca.account_no IS NOT NULL THEN 'Current'
          ELSE 'Personal'
        END AS type,
        u.branch,
        CASE WHEN u.status = 'Malaysian' THEN true ELSE false END AS "isMalaysian"
      FROM banka."User" u
      JOIN banka."Customer" c
        ON u.cust_id = c.cust_id
      LEFT JOIN banka."Current_account" ca
        ON u.user_id = ca.user_id
      WHERE u.cust_id = (
        SELECT cust_id
        FROM banka."User"
        WHERE LOWER(username) = LOWER($1)
        LIMIT 1
      );
    `;

    const result = await pool.query(query, [username]);

    const accounts = result.rows.map((row) => ({
      id: row.id,
      username: row.username,
      name: row.username,
      email: row.email ? decrypt(row.email, "banka") : "",
      phone: row.phone ? decrypt(row.phone, "banka") : "",
      avatar: row.avatar,
      type: row.type,
      isMalaysian: row.isMalaysian,
    }));

    return NextResponse.json(accounts);
  } catch (error: any) {
    console.error("Error fetching user list details:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch active banking accounts" },
      { status: 500 }
    );
  }
}

// Registration Account Creation 
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const {
      cust_id,
      username,
      password,
      status,
      sec_phrase,
      branch,
      img,
    } = body;

    if (!cust_id || !username || !password || !status || !sec_phrase || !branch) {
      return NextResponse.json(
        { error: "Missing required user fields." },
        { status: 400 }
      );
    }

    const query = `
      INSERT INTO banka."User" (
        cust_id,
        username,
        password,
        status,
        sec_phrase,
        branch,
        img
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;

    const values = [
      cust_id,
      username,
      password,
      status,
      sec_phrase,
      branch,
      img || null,
    ];

    const result = await pool.query(query, values);

    return NextResponse.json(
      {
        message: "User account created successfully",
        data: result.rows[0],
      },
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