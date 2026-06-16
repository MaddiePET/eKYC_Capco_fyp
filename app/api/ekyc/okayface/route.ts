import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Expecting standard JSON now instead of heavy multi-part form data
    const { journeyId, selfieUrl, idCardUrl } = await req.json();

    if (!journeyId || !selfieUrl || !idCardUrl) {
      return NextResponse.json({ error: "Missing journeyId, selfieUrl, or idCardUrl" }, { status: 400 });
    }

    console.log("Downloading images from Supabase for OkayFace mapping...");

    // Download both files concurrently
    const [selfieRes, idCardRes] = await Promise.all([
      fetch(selfieUrl),
      fetch(idCardUrl)
    ]);

    if (!selfieRes.ok || !idCardRes.ok) {
      return NextResponse.json({ error: "Failed to pull image references from supabase storage" }, { status: 400 });
    }

    // Convert them to blobs to append cleanly into our form submission
    const selfieBlob = await selfieRes.blob();
    const idCardBlob = await idCardRes.blob();

    const okayfaceUrl = `${process.env.INNOVA8TIF_API_URL}/okayface/v1-1`;
    const formData = new FormData();

    formData.append("journeyId", journeyId);
    formData.append("livenessDetection", "false");
    formData.append("imageBest", selfieBlob, "selfie.jpg");
    formData.append("imageIdCard", idCardBlob, "idcard.jpg");

    console.log("Calling Innov8tif /okayface for journeyId:", journeyId);

    const response = await fetch(okayfaceUrl, {
      method: "POST",
      body: formData,
    });

    const text = await response.text();
    let result: any = {};

    try {
      result = text ? JSON.parse(text) : {};
    } catch {
      console.error("Failed to parse OkayFace response:", text);
      return NextResponse.json({ error: "Invalid JSON response from OkayFace" }, { status: 500 });
    }

    console.log("OkayFace full response:", JSON.stringify(result, null, 2));

    return NextResponse.json(result, { status: response.status });
  } catch (error: any) {
    console.error("OkayFace route error:", error.message);
    return NextResponse.json({ error: "Authentication verification failed", details: error.message }, { status: 500 });
  }
}