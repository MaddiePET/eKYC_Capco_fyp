import { NextResponse } from "next/server";
import { lookupJPNIdentity } from "../../../../jpn-db/jpn-api.mjs";
import { lookupJIMIdentity } from "../../../../jim-db/jim-api.mjs";

async function lookupIdentity(idType: string, idNum: string) {
  if (!idNum) return null;

  const normalizedIdType = idType.toLowerCase();

  if (normalizedIdType === "ic") {
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
      ...result,
      full_name: result.full_name || result.name || `${result.fname} ${result.lname}`.trim(),
      id_num: result.ic_number || result.passport_no || idNum,
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