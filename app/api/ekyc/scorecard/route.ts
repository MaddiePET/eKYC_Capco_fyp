import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const journeyId = searchParams.get("journeyId");

    if (!journeyId) {
      return NextResponse.json(
        { error: "Missing journeyId" },
        { status: 400 }
      );
    }

    const scorecardBaseUrl = process.env.INNOVA8TIF_API_URL;
    const username = process.env.INNOVA8TIF_USER;
    const password = process.env.INNOVA8TIF_PASS;

    if (!scorecardBaseUrl) {
      return NextResponse.json(
        { error: "Missing INNOVA8TIF_API_URL" },
        { status: 500 }
      );
    }

    if (!username || !password) {
      return NextResponse.json(
        { error: "Missing Innov8tif username or password" },
        { status: 500 }
      );
    }

    const scorecardUrl =
      `${scorecardBaseUrl}/scorecard` +
      `?journeyId=${encodeURIComponent(journeyId)}`;

    const auth = Buffer.from(`${username}:${password}`).toString("base64");

    console.log("Scorecard request URL:", scorecardUrl);

    const scorecardResponse = await fetch(scorecardUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${auth}`,
      },
    });

    console.log("Scorecard response status:", scorecardResponse.status);

    const scorecardText = await scorecardResponse.text();

    console.log("Scorecard raw response:", scorecardText);

    let scorecardResult: Record<string, unknown> = {};

    try {
      scorecardResult = scorecardText ? JSON.parse(scorecardText) : {};

      console.log(
        "Scorecard full response:",
        JSON.stringify(scorecardResult, null, 2)
      );
    } catch (parseError: unknown) {
      const message = parseError instanceof Error ? parseError.message : String(parseError);

      console.error("Scorecard parse failed:", message);
      console.error("Scorecard raw response:", scorecardText);

      return NextResponse.json(
        {
          error: "Failed to parse scorecard response",
          details: message,
          rawResponse: scorecardText,
        },
        { status: 500 }
      );
    }

    if (!scorecardResponse.ok) {
      return NextResponse.json(
        {
          error: "Scorecard API failed",
          scorecardError: scorecardResult,
        },
        { status: scorecardResponse.status }
      );
    }

    return NextResponse.json(scorecardResult, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);

    console.error(
      "Scorecard route error:",
      message,
      error instanceof Error ? error.stack : ""
    );

    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: message,
      },
      { status: 500 }
    );
  }
}