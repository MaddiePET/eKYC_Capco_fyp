import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { journeyId, type, isBack, imageUrl, fullSizeImageUrl } = body;

    if (!journeyId || !type || !imageUrl) {
      return NextResponse.json({ error: "Missing journeyId, type, or imageUrl" }, { status: 400 });
    }

    const supabaseResponse = await fetch(imageUrl);
    if (!supabaseResponse.ok) {
      return NextResponse.json({ error: "Failed to download main target image from supabase" }, { status: 400 });
    }
    const arrayBuffer = await supabaseResponse.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");

    const okaydocUrl = `${process.env.INNOVA8TIF_API_URL}/okaydoc`;
    let okaydocBody: Record<string, unknown>;

    if (type === "passport") {
      let finalFullSizeBase64 = "";
      if (fullSizeImageUrl) {
        const fullSizeRes = await fetch(fullSizeImageUrl);
        if (fullSizeRes.ok) {
          const fullSizeBuf = await fullSizeRes.arrayBuffer();
          finalFullSizeBase64 = Buffer.from(fullSizeBuf).toString("base64");
        }
      }

      okaydocBody = {
        journeyId: journeyId,
        type: "passport",
        country: "OTHER",
        halfSizeImage: base64Image,
        fullSizeImage: finalFullSizeBase64
      };
    } else if (isBack) {
      okaydocBody = {
        journeyId: journeyId,
        type: "nonpassport",
        idImageBase64Image: base64Image,
        version: "2",
        docType: "mykad_back"
      };
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
        islamFieldTamperingDetection: "true",
        qualityCheckDetection: "true"
      };
    } 

    const okaydocResponse = await fetch(okaydocUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(okaydocBody),
    });

    const okaydocText = await okaydocResponse.text();
    let okaydocResult: Record<string, unknown> = {};

    try {
      okaydocResult = okaydocText ? JSON.parse(okaydocText) : {};
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
    console.error("OkayDoc route error:", message);
    return NextResponse.json({ error: "Internal Server Error", details: message }, { status: 500 });
  }
}