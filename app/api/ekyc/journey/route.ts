import { NextResponse } from "next/server";

export async function POST() {
  try {
    const baseUrl = process.env.INNOV8TIF_API_BASE_URL;
    const username = process.env.INNOV8TIF_USER;
    const password = process.env.INNOV8TIF_PASS;

    console.log("Calling Innov8tif at:", `${baseUrl}/journeyid`);

    const res = await fetch(`${baseUrl}/journeyid`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      cache: "no-store", 
    });
    
    const data = await res.json();
    console.log("Innov8tif Response:", data); 

    if (data.status === "success") {
      return NextResponse.json({ journeyId: data.journeyId });
    } else {
      return NextResponse.json({ error: "Auth failed with Innov8tif", details: data }, { status: 401 });
    }
  } catch (error) {
    console.error("Backend Error in Journey Route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}