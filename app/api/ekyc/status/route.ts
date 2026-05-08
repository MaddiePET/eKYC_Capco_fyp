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
    const { journeyId, status, id_type, id_num } = await req.json();

    if (!journeyId || !status) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    statusStore.set(journeyId, {
      status,
      id_type,
      id_num,
    });

    return NextResponse.json({
      success: true,
      status,
      id_type,
      id_num,
    });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}