import { NextResponse } from 'next/server';

// NOTE: This uses an in-memory Map which is fine for development testing.
// Save this status in a database (Pgadmin) 
// using the `journeyId` as the key.
const statusStore = new Map<string, string>();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const journeyId = searchParams.get('journeyId');

  if (!journeyId) {
    return NextResponse.json({ error: 'Missing journeyId' }, { status: 400 });
  }
  
  const status = statusStore.get(journeyId) || 'pending';
  return NextResponse.json({ status });
}

export async function POST(req: Request) {
  try {
    const { journeyId, status } = await req.json();

    if (!journeyId || !status) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }
    
    // Save the status so the Desktop component polling loop can detect it
    statusStore.set(journeyId, status);
    
    return NextResponse.json({ success: true, status });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}