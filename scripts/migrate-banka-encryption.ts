import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

console.log("DB password exists:", typeof process.env.DB_PASSWORD);

const { pool } = await import("../lib/db");
const { encrypt, hashLookup } = await import("../lib/cryptoSecurity");

async function migrate() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const customers = await client.query(`
      SELECT cust_id, id_num, full_name, ph_no, email
      FROM banka."Customer"
      WHERE id_num_hash IS NULL
    `);

    for (const row of customers.rows) {
      await client.query(
        `
        UPDATE banka."Customer"
        SET
          id_num_hash = $1,
          id_num = $2,
          full_name = $3,
          ph_no = $4,
          email = $5
        WHERE cust_id = $6
        `,
        [
          hashLookup(row.id_num),
          encrypt(row.id_num, "banka"),
          encrypt(row.full_name, "banka"),
          encrypt(row.ph_no, "banka"),
          encrypt(row.email, "banka"),
          row.cust_id,
        ]
      );
    }

    const addresses = await client.query(`
      SELECT add_id, add_1, add_2, postcode, state, country
      FROM banka."Address"
      WHERE add_1 IS NULL
    `);

    for (const row of addresses.rows) {
      await client.query(
        `
        UPDATE banka."Address"
        SET
          add_1 = $1,
          add_2 = $2,
          postcode = $3,
          state = $4,
          country = $5
        WHERE add_id = $6
        `,
        [
          encrypt(row.add_1, "banka"),
          encrypt(row.add_2, "banka"),
          encrypt(row.postcode, "banka"),
          encrypt(row.state, "banka"),
          encrypt(row.country, "banka"),
          row.add_id,
        ]
      );
    }

    await client.query("COMMIT");
    console.log("Migration completed safely.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Migration failed:", err);
  } finally {
    client.release();
  }
}

migrate();