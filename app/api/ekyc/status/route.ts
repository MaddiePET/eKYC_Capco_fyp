import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const journeyId = searchParams.get("journeyId");

  if (!journeyId) {
    return NextResponse.json({ error: "Missing journeyId" }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT status, step, id_type, id_num, scorecard
       FROM banka."Ekyc_status"
       WHERE journey_id = $1`,
      [journeyId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ status: "pending" });
    }

    const row = result.rows[0];
    return NextResponse.json({
      status:    row.status,
      step:      row.step,
      id_type:   row.id_type,
      id_num:    row.id_num,
      scorecard: row.scorecard,
    });
  } finally {
    client.release();
  }
}

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { journeyId, status, id_type, id_num, step, scorecard } = body;

  if (!journeyId || !status) {
    return NextResponse.json({ error: "Missing journeyId or status" }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    // Upsert: insert on first write, update on subsequent writes.
    const result = await client.query(
      `INSERT INTO banka."Ekyc_status"
         (journey_id, status, step, id_type, id_num, scorecard, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (journey_id) DO UPDATE SET
         status     = EXCLUDED.status,
         step       = COALESCE(EXCLUDED.step,      banka."Ekyc_status".step),
         id_type    = COALESCE(EXCLUDED.id_type,   banka."Ekyc_status".id_type),
         id_num     = COALESCE(EXCLUDED.id_num,    banka."Ekyc_status".id_num),
         scorecard  = COALESCE(EXCLUDED.scorecard, banka."Ekyc_status".scorecard),
         updated_at = NOW()
       RETURNING *`,
      [
        journeyId,
        status,
        step     ?? null,
        id_type  ?? null,
        id_num   ?? null,
        scorecard ? JSON.stringify(scorecard) : null,
      ]
    );

    const row = result.rows[0];
    console.log("SAVING EKYC STATUS:", row);

    return NextResponse.json({
      success:   true,
      status:    row.status,
      step:      row.step,
      id_type:   row.id_type,
      id_num:    row.id_num,
      scorecard: row.scorecard,
    });
  } catch (error) {
    console.error("Ekyc status POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    client.release();
  }
}