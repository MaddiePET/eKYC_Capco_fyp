import { NextResponse } from "next/server";
import { lookupJPNIdentity } from "../../../../jpn-db/jpn-api.mjs";
import { lookupJIMIdentity } from "../../../../jim-db/jim-api.mjs";

async function lookupIdentity(idType: string, idNum: string) {
  if (!idNum) return null;

  const normalizedIdType = idType.toLowerCase();

  if (
    normalizedIdType === "ic" || 
    normalizedIdType === "mykad" || 
    normalizedIdType === "nric"
  ) {
    return await lookupJPNIdentity(idNum);
  }

  if (normalizedIdType === "passport") {
    return await lookupJIMIdentity(idNum);
  }

  return null;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const idType = url.searchParams.get("id_type");
    const idNum = url.searchParams.get("id_num");

    if (!idType || !idNum) {
      return NextResponse.json(
        { error: "Missing id_type or id_num query parameters" },
        { status: 400 }
      );
    }

    const result = await lookupIdentity(idType, idNum);

    if (!result) {
      return NextResponse.json({
        success: false,
        message: "Identity not found in government databases",
      });
    }

    return NextResponse.json({
      success: true,
      source: result.source,
      identity: result.identity,
      formData: result.formData,
      full_name: result.formData.full_name,
      id_num: result.formData.id_number,
    });
  } catch (error: any) {
    console.error("Identity lookup error:", error);

    return NextResponse.json(
      {
        error: error.message || "Failed to lookup identity",
      },
      { status: 500 }
    );
  }
}