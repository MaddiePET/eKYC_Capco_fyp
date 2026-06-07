import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { journeyId, type, isBack } = body;
    const base64Image = body.halfSizeImage || body.base64ImageString || body.idImageBase64Image;

    if (!journeyId || !type || !base64Image) {
      return NextResponse.json({ error: "Missing journeyId, type, or image data" }, { status: 400 });
    }

    const okaydocUrl = `${process.env.INNOVA8TIF_API_URL}/okaydoc`;
    let okaydocBody: Record<string, unknown>;

    if (type === "passport") {
      okaydocBody = {
        journeyId: journeyId,
        type: "passport",
        country: "OTHER",
        halfSizeImage: base64Image,
        fullSizeImage: body.fullSizeImage || ""
      };

      console.log("OkayDoc passport verification - journeyId:", journeyId);
    } else if (isBack) {
      okaydocBody = {
        journeyId: journeyId,
        type: "nonpassport",
        idImageBase64Image: base64Image,
        version: "2",
        docType: "mykad_back"
      };

      console.log("OkayDoc MyKad verification - journeyId:", journeyId);
    } else {
      okaydocBody = {
        journeyId: journeyId,
        type: "nonpassport",
        idImageBase64Image: base64Image,
        version: "7-1",
        docType: "mykad",
        landmarkCheck: "true",
        fontCheck: "true",
        microprintCheck: "true",
        photoSubstitutionCheck: "true",
        icTypeCheck: "true",
        colorMode: "true",
        hologram: "true",
        screenDetection: "true",
        ghostPhotoColorDetection: "true",
        idBlurDetection: "true",
        islamFieldTamperingDetection:"true",
        qualityCheckDetection:"true"
      };
      
      console.log("OkayDoc MyKad verification - journeyId:", journeyId);
    } 

    const okaydocResponse = await fetch(okaydocUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(okaydocBody),
    });

    console.log("OkayDoc response status:", okaydocResponse.status);
    const okaydocText = await okaydocResponse.text();
    let okaydocResult: Record<string, unknown> = {};

    try {
      okaydocResult = okaydocText ? JSON.parse(okaydocText) : {};
      const okaydocStatus = typeof (okaydocResult as { status?: unknown }).status === "string"
        ? (okaydocResult as { status?: string }).status
        : undefined;
      console.log("OkayDoc result - status:", okaydocStatus);
      console.log("OkayDoc full response:", JSON.stringify(okaydocResult, null, 2));
    } catch (parseError: unknown) {
      const message = parseError instanceof Error ? parseError.message : String(parseError);
      console.error("Failed to parse OkayDoc response:", message);
      return NextResponse.json({
        error: "Authentication verification failed",
        details: message,
      }, { status: 500 });
    }

    if (!okaydocResponse.ok) {
      console.error("OkayDoc error (status " + okaydocResponse.status + "):", okaydocResult);
      return NextResponse.json({
        error: "Authentication verification failed",
        authError: okaydocResult,
      }, { status: okaydocResponse.status });
    }

    return NextResponse.json(okaydocResult, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("OkayDoc route error:", message, error instanceof Error ? error.stack : "");
    return NextResponse.json({ error: "Internal Server Error", details: message }, { status: 500 });
  }
}
