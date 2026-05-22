import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const incomingData = await req.formData();

    const journeyId = incomingData.get("journeyId") as string;
    const selfieFile = incomingData.get("selfie") as File;
    const idCardFile = incomingData.get("idCard") as File;

    if (!journeyId || !selfieFile || !idCardFile) {
      return NextResponse.json({ error: "Missing journeyId or images" }, { status: 400 });
    }

    const okayliveUrl = `${process.env.INNOVA8TIF_API_URL}/okaylive`;
    const formData = new FormData();

    formData.append("journeyId", journeyId);
    formData.append("livenessDetection", "true");
    formData.append("imageBest", selfieFile, "selfie.jpg");
    formData.append("imageIdCard", idCardFile, "idcard.jpg");

    console.log("Calling Innov8tif /okaylive for journeyId:", journeyId);

    const response = await fetch(okayliveUrl, {
      method: "POST",
      body: formData,
    });

    const text = await response.text();
    let result: any = {};

    try {
      result = text ? JSON.parse(text) : {};
    } catch (parseError) {
      console.error("Failed to parse OkayLive response:", text);
      return NextResponse.json({ error: "Invalid JSON response from OKayLive" }, { status: 500 });
    }

    console.log("OKayLive full response:", JSON.stringify(result, null, 2));

    return NextResponse.json(result, { status: response.status });
  } catch (error: any) {
    console.error("OKayLive route error:", error.message);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}