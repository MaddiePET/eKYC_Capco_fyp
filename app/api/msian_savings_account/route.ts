import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

// Generate a 16-character account number
// Format: SA + 14 random digits
function generateAccountNo(): string {
  const randomDigits = Math.floor(Math.random() * 10 ** 14)
    .toString()
    .padStart(14, "0");

  return `SA${randomDigits}`;
}

// Capitalize first letter of each word
function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Generate a unique savings account number
async function generateUniqueAccountNo(client: any): Promise<string> {
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

    const checkResult = await client.query(checkQuery, [accountNo]);
    exists = checkResult.rows.length > 0;
  }

  return accountNo;
}

// Final submission route for Malaysian personal savings account onboarding
export async function POST(req: NextRequest): Promise<NextResponse> {
  const client = await pool.connect();

  try {
    const body = await req.json();

    const {
      customer,
      homeAddress,
      mailingAddress,
      savingsAccount,
      user,
    } = body;

    // ----------------------------
    // Basic validation
    // ----------------------------
    if (
      !customer ||
      !homeAddress ||
      !savingsAccount ||
      !user
    ) {
      return NextResponse.json(
        { error: "Missing required submission sections." },
        { status: 400 }
      );
    }

    if (
      !customer.id_num ||
      !customer.full_name ||
      !customer.id_type ||
      !customer.dob ||
      !customer.ph_no_1 ||
      !customer.email ||
      !customer.country
    ) {
      return NextResponse.json(
        { error: "Missing required customer fields." },
        { status: 400 }
      );
    }

    if (
      !homeAddress.add_type ||
      !homeAddress.add_1 ||
      !homeAddress.add_2 ||
      !homeAddress.postcode ||
      !homeAddress.state ||
      !homeAddress.country
    ) {
      return NextResponse.json(
        { error: "Missing required home address fields." },
        { status: 400 }
      );
    }

    if (
      !savingsAccount.occupation ||
      !savingsAccount.monthly_income ||
      !savingsAccount.income_source ||
      !savingsAccount.employment_type ||
      savingsAccount.is18 === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required savings account fields." },
        { status: 400 }
      );
    }

    if (
      !user.username ||
      !user.password ||
      !user.status ||
      !user.sec_phrase ||
      !user.branch
    ) {
      return NextResponse.json(
        { error: "Missing required user fields." },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    // ----------------------------
    // Step 1: Insert home address
    // ----------------------------
    const homeAddressQuery = `
      INSERT INTO banka."Address" (
        add_type,
        add_1,
        add_2,
        postcode,
        state,
        country
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const homeAddressValues = [
      homeAddress.add_type,
      homeAddress.add_1,
      homeAddress.add_2,
      homeAddress.postcode,
      homeAddress.state,
      homeAddress.country,
    ];

    const homeAddressResult = await client.query(homeAddressQuery, homeAddressValues);
    const homeAddressRow = homeAddressResult.rows[0];

    // ----------------------------
    // Step 2: Insert customer
    // ----------------------------
    const customerQuery = `
      INSERT INTO banka."Customer" (
        id_num,
        full_name,
        id_type,
        dob,
        ph_no_1,
        ph_no_2,
        email,
        country
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;

    const customerValues = [
      customer.id_num,
      customer.full_name,
      customer.id_type,
      customer.dob,
      customer.ph_no_1,
      customer.ph_no_2 || null,
      customer.email,
      customer.country
    ];

    const customerResult = await client.query(customerQuery, customerValues);
    const customerRow = customerResult.rows[0];

    // ----------------------------
    // Step 3: Insert mailing address if provided
    // If not provided, use home address as linked address
    // ----------------------------
    let finalAddressId = homeAddressRow.add_id;
    let mailingAddressRow = null;

    if (
      mailingAddress &&
      mailingAddress.add_1 &&
      mailingAddress.add_2 &&
      mailingAddress.postcode &&
      mailingAddress.state &&
      mailingAddress.country
    ) {
      const mailingAddressQuery = `
        INSERT INTO banka."Address" (
          add_type,
          add_1,
          add_2,
          postcode,
          state,
          country
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `;

      const mailingAddressValues = [
        mailingAddress.add_type || "Mailing",
        mailingAddress.add_1,
        mailingAddress.add_2,
        mailingAddress.postcode,
        mailingAddress.state,
        mailingAddress.country,
      ];

      const mailingAddressResult = await client.query(
        mailingAddressQuery,
        mailingAddressValues
      );

      mailingAddressRow = mailingAddressResult.rows[0];
      finalAddressId = mailingAddressRow.add_id;
    }

    // ----------------------------
    // Step 4: Insert user
    // ----------------------------
    const userQuery = `
      INSERT INTO banka."User" (
        cust_id,
        username,
        password,
        status,
        img,
        sec_phrase,
        branch
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;

    const userValues = [

      customerRow.cust_id,
      user.username,
      user.password,
      user.status,
      user.img || null,
      user.sec_phrase,
      user.branch,
    ];

    const userResult = await client.query(userQuery, userValues);
    const userRow = userResult.rows[0];


    // ----------------------------
    // Step 5: Insert savings account
    // ----------------------------
    const accountNo = await generateUniqueAccountNo(client);

    const savingsAccountQuery = `
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

    const savingsAccountValues = [
      accountNo,
      userRow.user_id,
      toTitleCase(savingsAccount.occupation),
      savingsAccount.monthly_income,
      toTitleCase(savingsAccount.income_source),
      toTitleCase(savingsAccount.employment_type),
      savingsAccount.is18,
      finalAddressId,
    ];

    const savingsAccountResult = await client.query(
      savingsAccountQuery,
      savingsAccountValues
    );
    const savingsAccountRow = savingsAccountResult.rows[0];

    
    await client.query("COMMIT");

    return NextResponse.json(
      {
        message: "Malaysian savings account application submitted successfully.",
        data: {
          customer: customerRow,
          homeAddress: homeAddressRow,
          mailingAddress: mailingAddressRow,
          savingsAccount: savingsAccountRow,
          user: userRow,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("Final submission error:", error);

    return NextResponse.json(
      { error: error.message || "Failed to submit Malaysian savings account application." },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}