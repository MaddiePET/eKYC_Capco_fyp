import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

// Handle POST request to save address data into PostgreSQL
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Read JSON body sent from the frontend form
    const body = await req.json();

    // Destructure address fields from request body
    const {
      add_type,
      add_1,
      postcode,
      city,
      state,
      country,
    } = body;

    // Basic validation for required fields
    if (!add_type || !add_1 || !postcode || !city || !state || !country) {
      return NextResponse.json(
        { error: "Missing required address fields." },
        { status: 400 }
      );
    }

    // SQL query to insert address data into the banka schema Address table
    const query = `
      INSERT INTO banka."Address" (
        add_type,
        add_1,
        postcode,
        city,
        state,
        country
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    // Values matched in order with the SQL placeholders above
    const values = [
      add_type,
      add_1,
      postcode,
      city,
      state,
      country,
    ];

    // Run the SQL query using the existing PostgreSQL pool connection
    const result = await pool.query(query, values);

    // Return success response with inserted address row
    return NextResponse.json(
      {
        message: "Address saved successfully",
        data: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error: any) {
    // Log server/database error in terminal
    console.error("Error saving address:", error);

    // Return error response to frontend
    return NextResponse.json(
      { error: error.message || "Failed to save address" },
      { status: 500 }
    );
  }
}