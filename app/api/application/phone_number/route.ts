/*import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

// Update customer's primary phone number in the Customer table
export async function PUT(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();

    const { cust_id, ph_no_1 } = body;

    if (cust_id === undefined || cust_id === null || !ph_no_1) {
      return NextResponse.json(
        { error: "cust_id and ph_no_1 are required." },
        { status: 400 }
      );
    }

    const query = `
      UPDATE banka."Customer"
      SET ph_no_1 = $1
      WHERE cust_id = $2
      RETURNING *;
    `;

    const values = [ph_no_1, cust_id];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Customer not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Phone number updated successfully",
        data: result.rows[0],
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating phone number:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update phone number" },
      { status: 500 }
    );
  }
}*/