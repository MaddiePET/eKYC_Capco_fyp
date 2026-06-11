import { NextResponse } from "next/server";

export const runtime = "nodejs";
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
    console.log("[identity/lookup] Request received");
    const url = new URL(req.url);

    const lookup = url.searchParams.get("lookup");
    const idType = url.searchParams.get("id_type");
    const idNum = url.searchParams.get("id_num");

    console.log("[identity/lookup] Params:", {
      lookup,
      idType,
      hasIdNum: !!idNum,
    });

    if (!idNum) {
      console.log("[identity/lookup] Missing id_num");
      return NextResponse.json(
        { error: "Missing id_num query parameter" },
        { status: 400 }
      );
    }

    if (lookup === "ssm_businesses") {
      console.log("[identity/lookup] Looking up SSM businesses");

      const businesses = await lookupSSMBusinesses(idNum);

      console.log(
        "[identity/lookup] SSM lookup complete. Count:",
        businesses.length
      );

      if (businesses.length === 0) {
        return NextResponse.json({
          success: true,
          source: "SSM",
          message: "No registered business linked with your MyKad number.",
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
      console.log("[identity/lookup] Missing id_type");
      return NextResponse.json(
        { error: "Missing id_type query parameter" },
        { status: 400 }
      );
    }

    console.log("[identity/lookup] Looking up identity:", idType);

    const result = await lookupIdentity(idType, idNum);

    console.log(
      "[identity/lookup] Lookup complete. Found:",
      !!result
    );

    if (!result) {
      return NextResponse.json({
        success: false,
        message: "Identity not found in government databases.",
      });
    }

    console.log(
      "[identity/lookup] Returning success from source:",
      result.source
    );

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
    console.error("[identity/lookup] STACK:", error?.stack);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to lookup identity",
      },
      { status: 500 }
    );
  }
}