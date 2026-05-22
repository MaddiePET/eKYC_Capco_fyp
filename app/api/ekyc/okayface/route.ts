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

    const okayfaceUrl = `${process.env.INNOVA8TIF_API_URL}/okayface/v1-1`;
    const formData = new FormData();

    formData.append("journeyId", journeyId);
    formData.append("livenessDetection", "false");
    formData.append("imageBest", selfieFile, "selfie.jpg");
    formData.append("imageIdCard", idCardFile, "idcard.jpg");

    console.log("Calling Innov8tif /okayface for journeyId:", journeyId);

    const response = await fetch(okayfaceUrl, {
      method: "POST",
      body: formData,
    });

    const text = await response.text();
    let result: any = {};

    try {
      result = text ? JSON.parse(text) : {};
    } catch (parseError) {
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