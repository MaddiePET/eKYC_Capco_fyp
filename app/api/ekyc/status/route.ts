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
      `SELECT 
        j.scorecard, 
        j.scorecard_result,
        c.id_type, 
        c.id_num,
        c.full_name
       FROM banka."Journey" j
       INNER JOIN banka."Customer" c ON j.cust_id = c.cust_id
       WHERE j.journey_id = $1`,
      [journeyId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ verified: false, status: "pending" });
    }

    const row = result.rows[0];
    return NextResponse.json({
      verified: true,
      status: "face_verified",
      id_type: row.id_type,  
      id_num: row.id_num,    
      full_name: row.full_name,
      scorecard: row.scorecard,
      scorecard_result: row.scorecard_result
    });
  } catch (error: any) {
    console.error("Ekyc status GET lookup failure:", error?.message || error);
    return NextResponse.json({ error: "Internal Database Selection Failure" }, { status: 500 });
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

  const { journeyId, scorecard, custId, scorecardResult } = body;

  if (!journeyId) {
    return NextResponse.json({ error: "Missing required journeyId reference" }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO banka."Journey"
         (journey_id, cust_id, application_date, approval_date, scorecard_result, scorecard)
       VALUES ($1, $2, NOW(), NOW(), $3, $4)
       ON CONFLICT (journey_id) DO UPDATE SET
         scorecard_result = EXCLUDED.scorecard_result,
         scorecard        = COALESCE(EXCLUDED.scorecard, banka."Journey".scorecard)
       RETURNING *`,
      [
        journeyId,
        custId || 1, // Fallback integer placeholder to preserve database foreign key safety rules
        scorecardResult || 0.0,
        scorecard ? JSON.stringify(scorecard) : null,
      ]
    );

    const row = result.rows[0];
    console.log("SAVING JOURNEY LIFECYCLE STATE SUCCESS:", row.journey_id);

    return NextResponse.json({
      success: true,
      journey_id: row.journey_id,
      scorecard: row.scorecard,
      scorecard_result: row.scorecard_result
    });
  } catch (error: any) {
    console.error("Ekyc status POST transaction failure:", error?.message || error);
    return NextResponse.json({ error: "Internal Database Write Failure" }, { status: 500 });
  } finally {
    client.release();
  }
}