import { NextResponse } from 'next/server';

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
    
    statusStore.set(journeyId, status);
    
    return NextResponse.json({ success: true, status });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}