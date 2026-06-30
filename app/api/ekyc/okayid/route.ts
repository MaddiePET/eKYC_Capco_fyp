import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { journeyId, supabaseImageUrl, imageFormat = "JPG" } = await req.json();

    if (!journeyId || !supabaseImageUrl) {
      return NextResponse.json({ error: "Missing journeyId or supabaseImageUrl" }, { status: 400 });
    }

    const supabaseResponse = await fetch(supabaseImageUrl);
    if (!supabaseResponse.ok) {
      return NextResponse.json({ error: "Failed to download image from supabase storage" }, { status: 400 });
    }
    
    const arrayBuffer = await supabaseResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64ImageString = buffer.toString("base64");

    const okayidUrl = `${process.env.INNOVA8TIF_API_URL}/okayid`;
    const okayidBody = {
      journeyId,
      base64ImageString: base64ImageString,
      imageFormat,
      imageEnabled: false,
      faceImageEnabled: false,
      cambodia: false,
    };

    const okayidResponse = await fetch(okayidUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(okayidBody),
    });

    const okayidText = await okayidResponse.text();
    let okayidResult: Record<string, unknown> = {};

    try {
      okayidResult = okayidText ? JSON.parse(okayidText) : {};
    } catch (parseError: unknown) {
      const message = parseError instanceof Error ? parseError.message : String(parseError);
      console.error("Failed to parse OkayID response:", message);
      return NextResponse.json({
        error: "OCR extraction failed",
        details: message,
      }, { status: 500 });
    }

    if (!okayidResponse.ok) {
      console.error("OkayID error (status " + okayidResponse.status + "):", okayidResult);
      return NextResponse.json({
        error: "OCR extraction failed",
        okayidError: okayidResult,
      }, { status: okayidResponse.status });
    }

    const result = (okayidResult as any)?.result?.[0];

    if (!result?.ListVerifiedFields?.pFieldMaps) {
      console.error("Invalid OCR structure:", okayidResult);
      return NextResponse.json(
        {
          error: "OCR failed - invalid response structure",
          raw: okayidResult,
        },
        { status: 422 }
      );
    }

    const fieldMaps = result.ListVerifiedFields.pFieldMaps;
    const passportNo =
      fieldMaps.find((field: any) => field.FieldType === 2)?.Field_Visual ||
      fieldMaps.find((field: any) => field.FieldType === 2)?.Field_MRZ ||
      "";

    if (!passportNo || passportNo.trim().length < 5) {
      return NextResponse.json(
        {
          error: "Passport extraction failed - invalid or empty result",
          raw: okayidResult,
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      {
        status: "success",
        extracted: {
          passport_no: passportNo,
        },
        result: okayidResult,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("OkayID route error:", message);
    return NextResponse.json({ error: "Internal Server Error", details: message }, { status: 500 });
  }
}