/*import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

// Create a new digital banking user linked to an existing customer
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
}*/