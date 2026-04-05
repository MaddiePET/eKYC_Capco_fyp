import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { Pool } from "pg";
import bcrypt from "bcrypt";

console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASS:', process.env.DB_PASSWORD);
console.log('DB_PASS type:', typeof process.env.DB_PASSWORD); 

export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 5432,
});

async function hashPasswords() {
  try {
    // 1. Get all users
    const res = await pool.query(`SELECT user_id, password FROM banka."User"`);

    for (const user of res.rows) {
      // 2. Hash each password
      const hashed = await bcrypt.hash(user.password, 10); // saltRounds = 10

      // 3. Update the user record
      await pool.query(
        `UPDATE banka."User" SET password = $1 WHERE user_id = $2`,
        [hashed, user.user_id]
      );

      console.log(`Hashed password for user_id: ${user.user_id}`);
    }

    console.log("All passwords hashed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error hashing passwords:", err);
    process.exit(1);
  }
}

hashPasswords();