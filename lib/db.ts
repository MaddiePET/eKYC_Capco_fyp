import { Pool } from "pg";

export const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "banka",
  password: "asheroo88",
  port: 5432,
});