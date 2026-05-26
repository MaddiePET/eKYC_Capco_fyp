import { NextResponse } from "next/server";
import { lookupJPNIdentity } from "../../../../jpn-db/jpn-api";
import { lookupJIMIdentity } from "../../../../jim-db/jim-api";
import { lookupSSMBusinesses } from "../../../../ssm-db/ssm-api";

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

    const lookup = url.searchParams.get("lookup");
    const idType = url.searchParams.get("id_type");
    const idNum = url.searchParams.get("id_num");

    if (!idNum) {
      return NextResponse.json(
        { error: "Missing id_num query parameter" },
        { status: 400 }
      );
    }

    if (lookup === "ssm_businesses") {
      const businesses = await lookupSSMBusinesses(idNum);

      if (businesses.length === 0) {
        return NextResponse.json({
          success: true,
          source: "SSM",
          message: "No registered business linked with your IC number.",
          businesses: [],
        });
      }

      return NextResponse.json({
        success: true,
        source: "SSM",
        message: "Linked businesses found",
        businesses,
      });
    }

    if (!idType) {
      return NextResponse.json(
        { error: "Missing id_type query parameter" },
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
      phone_number: (result.formData as any)["phone_number"] || ""
    });
  } catch (error: any) {
    console.error("Identity lookup error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to lookup identity",
      },
      { status: 500 }
    );
  }
}