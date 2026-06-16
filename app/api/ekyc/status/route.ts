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
    // 1. Check if a finalized, fully registered account record exists in the primary database
    const completedResult = await client.query(
      `SELECT j.scorecard, j.scorecard_result, c.id_type, c.id_num, c.full_name
       FROM banka."Journey" j
       INNER JOIN banka."Customer" c ON j.cust_id = c.cust_id
       WHERE j.journey_id = $1`,
      [journeyId]
    );

    if (completedResult.rows.length > 0) {
      const row = completedResult.rows[0];
      return NextResponse.json({
        verified: true,
        status: "face_verified",
        step: "COMPLETED",
        id_type: row.id_type,
        id_num: row.id_num,
        full_name: row.full_name,
        scorecard: row.scorecard,
        scorecard_result: row.scorecard_result
      });
    }

    // 2. Fallback: Read active mid-flow mobile updates from the staging session space
    const stagingResult = await client.query(
      `SELECT status, step, id_type, id_num, scorecard, scorecard_result 
       FROM banka."Ekyc_Staging_Session" 
       WHERE journey_id = $1`,
      [journeyId]
    );

    if (stagingResult.rows.length === 0) {
      return NextResponse.json({ status: "pending", step: "ID_UPLOAD" });
    }

    const stageRow = stagingResult.rows[0];
    
    // 🎯 MATCH THE OLD OBJECT CONTRACT EXACTLY TO TRIGGER FRONTEND DASHBOARD STATE REDIRECTS
    return NextResponse.json({
      status: stageRow.status || "pending",
      step: stageRow.step,
      id_type: stageRow.id_type,
      id_num: stageRow.id_num,
      scorecard: stageRow.scorecard,
      scorecard_result: stageRow.scorecard_result
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

  // 📥 EXTRACT EVERY FIELD THE MOBILE SENDS (Matching your old Map setup logic perfectly!)
  const { journeyId, status, step, id_type, id_num, scorecard, scorecardResult } = body;

  if (!journeyId || !status) {
    return NextResponse.json({ error: "Missing journeyId or status" }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    // Calculate pass thresholds dynamically if scorecard lists are attached mid-stream
    let computedScore = scorecardResult || 0.0;
    if (scorecard?.scorecardResultList) {
      let total = 0, passed = 0;
      for (const item of scorecard.scorecardResultList) {
        for (const check of (item.checkResultList || [])) {
          total++;
          if (check.checkStatus === "P") passed++;
        }
      }
      if (total > 0) computedScore = Number(((passed / total) * 100).toFixed(2));
    }

    // ✅ SAFE WRITE: Save EVERYTHING the phone posts into staging rows, keeping updates cohesive
    const result = await client.query(
      `INSERT INTO banka."Ekyc_Staging_Session" 
         (journey_id, status, step, id_type, id_num, scorecard, scorecard_result, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       ON CONFLICT (journey_id) DO UPDATE SET
         status           = EXCLUDED.status,
         step             = COALESCE(EXCLUDED.step, banka."Ekyc_Staging_Session".step),
         id_type          = COALESCE(EXCLUDED.id_type, banka."Ekyc_Staging_Session".id_type),
         id_num           = COALESCE(EXCLUDED.id_num, banka."Ekyc_Staging_Session".id_num),
         scorecard        = COALESCE(EXCLUDED.scorecard, banka."Ekyc_Staging_Session".scorecard),
         scorecard_result = EXCLUDED.scorecard_result,
         updated_at       = NOW()
       RETURNING *`,
      [
        journeyId,
        status,
        step || null,
        id_type || null,
        id_num || null,
        scorecard ? JSON.stringify(scorecard) : null,
        computedScore
      ]
    );

    console.log("MOBILE STAGING PERSISTENCE SUCCESS:", result.rows[0].journey_id);

    return NextResponse.json({
      success: true,
      status: result.rows[0].status,
      step: result.rows[0].step
    });
  } catch (error: any) {
    console.error("Ekyc status POST transaction failure:", error?.message || error);
    return NextResponse.json({ error: "Internal Database Write Failure" }, { status: 500 });
  } finally {
    client.release();
  }
}