
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

// Handle POST request to save customer data into PostgreSQL
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Read JSON body sent from the frontend form
    const body = await req.json();

    // Destructure customer fields from request body
    const {
      id_num,
      fname,
      lname,
      id_type,
      dob,
      ph_no_1,
      ph_no_2,
      email,
      country,
    } = body;

    // Basic validation to make sure required fields are not empty
    if (!id_num || !fname || !lname || !id_type || !dob || !ph_no_1 || !email || !country) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    // SQL query to insert customer data into the Customer table
    // RETURNING * gives back the inserted row after saving
    const query = `
      INSERT INTO banka."Customer" (
        id_num,
        fname,
        lname,
        id_type,
        dob,
        ph_no_1,
        ph_no_2,
        email,
        country
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;

    // Values matched in order with the SQL placeholders above
    const values = [
      id_num,
      fname,
      lname,
      id_type,
      dob,
      ph_no_1,
      ph_no_2 || null, // if second phone number is empty, save as null
      email,
      country,
    ];

    // Run the SQL query using the existing PostgreSQL pool connection
    const result = await pool.query(query, values);

    // Return success response with inserted customer row
    return NextResponse.json(
      {
        message: "Customer saved successfully",
        data: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error: any) {
    // Log server/database error in terminal
    console.error("Error saving customer:", error);

    // Return error response to frontend
    return NextResponse.json(
      { error: error.message || "Failed to save customer" },
      { status: 500 }
    );
  }
}