import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

// Generates a random 16 digit savings account number
function generateAccountNumber() {
  let accountNo = "";

  for (let i = 0; i < 16; i++) {
    accountNo += Math.floor(Math.random() * 10).toString();
  }

  return accountNo;
}

export async function POST(req: Request) {
  // Get a database client from the connection pool
  const client = await pool.connect();

  try {
    // Read the data sent from the frontend or Postman
    const body = await req.json();

    const {
      id_type,
      id_num,
      full_name,
      dob,
      ph_no_1,
      ph_no_2,
      email,
      address,
      non_msian_details,
      non_msian_supporting_docs,
      user,
      savings_account,
    } = body;

    // Start transaction so all inserts succeed together or fail together
    await client.query("BEGIN");

    // 1. Insert address first because Customer needs home_add as a foreign key
    const addressResult = await client.query(
      `
      INSERT INTO banka."Address"
      (
        add_type,
        add_1,
        add_2,
        postcode,
        state,
        country
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING add_id
      `,
      [
        address.add_type || "Home",
        address.add_1,
        address.add_2,
        address.postcode,
        address.state,
        address.country,
      ]
    );

    // Store the generated address ID to use in Customer and Non_msian_details
    const addId = addressResult.rows[0].add_id;

    // 2. Insert customer details and link customer to address using home_add
    const customerResult = await client.query(
      `
      INSERT INTO banka."Customer"
      (
        id_num,
        full_name,
        id_type,
        dob,
        ph_no_1,
        ph_no_2,
        email,
        home_add
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING cust_id
      `,
      [
        id_num,
        full_name,
        id_type,
        dob,
        ph_no_1,
        ph_no_2 || null,
        email,
        addId,
      ]
    );

    // Store the generated customer ID for the next tables
    const custId = customerResult.rows[0].cust_id;

    // 3. Insert non Malaysian passport details
    await client.query(
      `
      INSERT INTO banka."Non_msian_details"
      (
        cust_id,
        pp_issue_office,
        pp_issue_date,
        pp_exp_date,
        home_add_id
      )
      VALUES ($1, $2, $3, $4, $5)
      `,
      [
        custId,
        non_msian_details.pp_issue_office,
        non_msian_details.pp_issue_date,
        non_msian_details.pp_exp_date,
        addId,
      ]
    );

    // 4. Insert non Malaysian supporting document records
    // These records are linked to the customer using cust_id
    if (Array.isArray(non_msian_supporting_docs)) {
      for (const doc of non_msian_supporting_docs) {
        await client.query(
          `
          INSERT INTO banka."Non_msian_supporting_docs"
          (
            cust_id,
            doc_name,
            doc_file
          )
          VALUES ($1, $2, $3)
          `,
          [
            custId,
            doc.doc_name,
            doc.doc_file || null,
          ]
        );
      }
    }

    // 5. Insert login/user profile details
    // This links the User record to the Customer using cust_id
    const userResult = await client.query(
      `
      INSERT INTO banka."User"
      (
        cust_id,
        username,
        password,
        status,
        img,
        sec_phrase,
        branch
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING user_id
      `,
      [
        custId,
        user.username,
        user.password,
        user.status || "Pending",
        user.img || null,
        user.sec_phrase,
        user.branch,
      ]
    );

    // Store the generated user ID for the Savings_account table
    const userId = userResult.rows[0].user_id;

    // 6. Generate a unique 16 digit savings account number
    let accountNo = generateAccountNumber();
    let accountExists = true;

    // Keep checking until the generated account number does not exist in the table
    while (accountExists) {
      const checkAccount = await client.query(
        `
        SELECT account_no
        FROM banka."Savings_account"
        WHERE account_no = $1
        `,
        [accountNo]
      );

      if (checkAccount.rows.length === 0) {
        accountExists = false;
      } else {
        accountNo = generateAccountNumber();
      }
    }

    // 7. Insert savings account details
    // This links the savings account to the User using user_id
    const savingsResult = await client.query(
      `
      INSERT INTO banka."Savings_account"
      (
        account_no,
        user_id,
        occupation,
        monthly_income,
        income_source,
        employment_type,
        is18
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING account_no
      `,
      [
        accountNo,
        userId,
        savings_account.occupation,
        savings_account.monthly_income,
        savings_account.income_source,
        savings_account.employment_type,
        savings_account.is18,
      ]
    );

    // Save all changes permanently after all inserts are successful
    await client.query("COMMIT");

    // Send success response back to frontend
    return NextResponse.json(
      {
        message: "Non-Malaysian savings account application created successfully",
        cust_id: custId,
        user_id: userId,
        account_no: savingsResult.rows[0].account_no,
      },
      { status: 201 }
    );
  } catch (error: any) {
    // Undo all inserts if any step fails
    await client.query("ROLLBACK");

    console.error("Non-Malaysian savings account error:", error);

    // Send error message back to frontend or Postman
    return NextResponse.json(
      {
        error:
          error.message ||
          "Failed to create non-Malaysian savings account application",
      },
      { status: 500 }
    );
  } finally {
    // Release the database client back to the pool
    client.release();
  }
}