import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { journeyId, base64ImageString } = await req.json();

    if (!journeyId || !base64ImageString) {
      return NextResponse.json({ error: "Missing journeyId or base64ImageString" }, { status: 400 });
    }

    console.log("Calling Innov8tif /okayid for OCR extraction - journeyId:", journeyId);
    const okayidUrl = `${process.env.INNOVA8TIF_API_URL}/okayid`;
    const okayidBody = {
      journeyId,
      base64ImageString: base64ImageString,
      imageFormat: "JPG",
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
      const okayidStatus = typeof (okayidResult as { status?: unknown }).status === "string"
        ? (okayidResult as { status?: string }).status
        : undefined;
      console.log("OkayID result - status:", okayidStatus);
      console.log("OkayID full response:", JSON.stringify(okayidResult, null, 2));
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

    return NextResponse.json(okayidResult, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("OkayID route error:", message, error instanceof Error ? error.stack : "");
    return NextResponse.json({ error: "Internal Server Error", details: message }, { status: 500 });
  }
}
