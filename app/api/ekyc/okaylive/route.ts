import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { journeyId, selfieUrl } = await req.json();

    if (!journeyId || !selfieUrl) {
      return NextResponse.json({ error: "Missing journeyId or selfieUrl" }, { status: 400 });
    }

    const fileResponse = await fetch(selfieUrl);
    if (!fileResponse.ok) {
      return NextResponse.json({ error: "Failed to download selfie from Supabase storage" }, { status: 400 });
    }
    
    const selfieBlob = await fileResponse.blob();
    const okayliveUrl = `${process.env.INNOVA8TIF_API_URL}/okaylive`;
    const formData = new FormData();

    formData.append("journeyId", journeyId);
    formData.append("livenessDetection", "true");
    formData.append("imageBest", selfieBlob, "selfie.jpg");

    const response = await fetch(okayliveUrl, {
      method: "POST",
      body: formData,
    });

    const text = await response.text();
    let result: any = {};

    try {
      result = text ? JSON.parse(text) : {};
    } catch {
      console.error("Failed to parse OkayLive response:", text);
      return NextResponse.json({ error: "Invalid JSON response from OKayLive" }, { status: 500 });
    }

    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("OKayLive route error:", message);
    return NextResponse.json({ error: "Internal Server Error", details: message }, { status: 500 });
  }
}