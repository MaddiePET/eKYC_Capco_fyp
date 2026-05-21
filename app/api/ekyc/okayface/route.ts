import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { journeyId, selfieBase64, idCardBase64 } = await req.json();

    if (!journeyId || !selfieBase64 || !idCardBase64) {
      return NextResponse.json({ error: "Missing journeyId or images" }, { status: 400 });
    }

    const okayfaceUrl = `${process.env.INNOVA8TIF_API_URL}/okayface/v1-1`;
    const formData = new FormData();
    
    formData.append("journeyId", journeyId);
    formData.append("livenessDetection", "false");

    const selfieBuffer = Buffer.from(selfieBase64, 'base64');
    const idCardBuffer = Buffer.from(idCardBase64, 'base64');

    formData.append("imageBest", new Blob([selfieBuffer], { type: 'image/jpeg' }), "selfie.jpg");
    formData.append("imageIdCard", new Blob([idCardBuffer], { type: 'image/jpeg' }), "idcard.jpg");

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
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}