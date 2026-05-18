import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

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
        u.username AS name,
        c.email AS email,
        c.ph_no AS phone,
        u.img AS avatar,
        u.branch AS type,
        CASE WHEN u.status = 'Malaysian' THEN true ELSE false END AS "isMalaysian"
      FROM banka."User" u
      JOIN banka."Customer" c
        ON u.cust_id = c.cust_id
      WHERE u.cust_id = (
        SELECT cust_id
        FROM banka."User"
        WHERE LOWER(username) = LOWER($1)
        LIMIT 1
      );
    `;

    const result = await pool.query(query, [username]);

    return NextResponse.json(result.rows);
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