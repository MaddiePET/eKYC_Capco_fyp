import { NextResponse } from "next/server";

export async function POST() {
  try {
    const res = await fetch(`${process.env.INNOVA8TIF_API_URL}/journeyid`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: process.env.INNOVA8TIF_USER,
        password: process.env.INNOVA8TIF_PASS,
      }),
    });

    const data = await res.json();

    if (data.status === "success") {
      return NextResponse.json({ journeyId: data.journeyId });
    }

    return NextResponse.json(
      { error: "Auth failed with Innov8tif" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Innov8tif API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}