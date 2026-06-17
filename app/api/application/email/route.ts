import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { encrypt } from "@/lib/cryptoSecurity";

export async function PUT(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { cust_id, email } = body;

    if (cust_id === undefined || cust_id === null || !email) {
      return NextResponse.json(
        { error: "cust_id and email are required." },
        { status: 400 }
      );
    }

    const query = `
      UPDATE banka."Customer"
      SET email = $1
      WHERE cust_id = $2
      RETURNING *;
    `;

    const values = [encrypt(email, "banka"), cust_id];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Customer not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Email updated successfully",
        data: result.rows[0],
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating email:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update email" },
      { status: 500 }
    );
  }
}