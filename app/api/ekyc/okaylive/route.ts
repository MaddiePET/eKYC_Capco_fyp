import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. Accept JSON body containing the Supabase image URL and optional ID document URL
    const { journeyId, selfieUrl } = await req.json();

    if (!journeyId || !selfieUrl) {
      return NextResponse.json({ error: "Missing journeyId or selfieUrl" }, { status: 400 });
    }

    console.log("Downloading selfie image from Supabase for OkayLive... Url:", selfieUrl);
    
    // 2. Fetch the selfie image from your public Supabase Storage bucket
    const fileResponse = await fetch(selfieUrl);
    if (!fileResponse.ok) {
      return NextResponse.json({ error: "Failed to download selfie from Supabase storage" }, { status: 400 });
    }
    
    // Convert the download stream directly into a Blob structure
    const selfieBlob = await fileResponse.blob();

    const okayliveUrl = `${process.env.INNOVA8TIF_API_URL}/okaylive`;
    const formData = new FormData();

    // 3. Rebuild the server-to-server form submission safely
    formData.append("journeyId", journeyId);
    formData.append("livenessDetection", "true");
    formData.append("imageBest", selfieBlob, "selfie.jpg");

    console.log("Calling Innov8tif /okaylive for journeyId:", journeyId);

    const response = await fetch(okayliveUrl, {
      method: "POST",
      body: formData, // Automatically maps the correct multi-part content headers outward!
    });

    const text = await response.text();
    let result: any = {};

    try {
      result = text ? JSON.parse(text) : {};
    } catch {
      console.error("Failed to parse OkayLive response:", text);
      return NextResponse.json({ error: "Invalid JSON response from OKayLive" }, { status: 500 });
    }

    console.log("OKayLive full response:", JSON.stringify(result, null, 2));
    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("OKayLive route error:", message);
    return NextResponse.json({ error: "Internal Server Error", details: message }, { status: 500 });
  }
}