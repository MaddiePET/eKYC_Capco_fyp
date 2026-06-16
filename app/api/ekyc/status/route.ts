import { NextResponse } from "next/server";

const statusStore = new Map<string, any>();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const journeyId = searchParams.get("journeyId");

  if (!journeyId) {
    return NextResponse.json({ error: "Missing journeyId" }, { status: 400 });
  }

  const data = statusStore.get(journeyId) || { status: "pending" };

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  try {
    const { journeyId, status, id_type, id_num, step, scorecard } = await req.json();

    if (!journeyId || !status) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const existingData = statusStore.get(journeyId) || {};

    const updatedData = {
      ...existingData,
      status, 
      ...(step !== undefined && { step }),
      ...(id_type !== undefined && { id_type }),
      ...(id_num !== undefined && { id_num }),
      ...(scorecard !== undefined && { scorecard }),

    };
    
    console.log("SAVING STATUS:", updatedData);

    statusStore.set(journeyId, updatedData);

    return NextResponse.json({
      success: true,
      ...updatedData,
    });
  } catch (error) {
    console.error("Status API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}