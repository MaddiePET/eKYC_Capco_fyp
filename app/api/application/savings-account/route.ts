import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

// Generate a simple 16-character account number 
//Format: SA + 14 random digits
function generateAccountNo(): string {
  const randomDigits = Math.floor(Math.random() * 10 ** 14).toString();
  return `SA${randomDigits}`;
}
// Generate a unique account number by checking the database first
async function generateUniqueAccountNo(): Promise<string> {
  let accountNo = "";
  let exists = true;

  while (exists) {
    accountNo = generateAccountNo();

    const checkQuery = `
      SELECT 1
      FROM banka."Savings_account"
      WHERE account_no = $1
      LIMIT 1;
    `;

    const checkResult = await pool.query(checkQuery, [accountNo]);
    exists = checkResult.rows.length > 0;
  }

  return accountNo;
}

// Handle POST request to save savings account data into PostgreSQL
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Read JSON body sent from the frontend form
    const body = await req.json();

    // Destructure savings account fields from request body
    const {
      user_id,
      occupation,
      monthly_income,
      income_source,
      employment_type,
      is18,
      add_id,
    } = body;

    // Basic validation for required fields
    if (
      user_id === undefined ||
      !occupation ||
      !monthly_income ||
      !income_source ||
      !employment_type ||
      is18 === undefined ||
      add_id === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required savings account fields." },
        { status: 400 }
      );
    }

    // Generate account number in backend
    const account_no = await generateUniqueAccountNo();

    // SQL query to insert savings account data into the banka schema Savings_account table
    const query = `
      INSERT INTO banka."Savings_account" (
        account_no,
        user_id,
        occupation,
        monthly_income,
        income_source,
        employment_type,
        is18,
        add_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;

    // Values matched in order with the SQL placeholders above
    const values = [
      account_no,
      user_id,
      occupation,
      monthly_income,
      income_source,
      employment_type,
      is18,
      add_id,
    ];

    // Run the SQL query using the existing PostgreSQL pool connection
    const result = await pool.query(query, values);

    // Return success response with inserted savings account row
    return NextResponse.json(
      {
        message: "Savings account saved successfully",
        data: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error: any) {
    // Log server/database error in terminal
    console.error("Error saving savings account:", error);

    // Return error response to frontend
    return NextResponse.json(
      { error: error.message || "Failed to save savings account" },
      { status: 500 }
    );
  }
}