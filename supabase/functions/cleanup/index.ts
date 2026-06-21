import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const CUT_OFF_MINUTES = 30; // change anytime for testing

Deno.serve(async () => {
  try {
    const cutoff = new Date(
      Date.now() - CUT_OFF_MINUTES * 60 * 1000
    ).toISOString();

    // 1. Get expired files
    const { data, error } = await supabase
      .from("identity_documents")
      .select("file_path")
      .lt("created_at", cutoff);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return Response.json({
        message: "No files to delete",
        cutoff,
      });
    }

    // SAFE TEST MODE: DO NOT DELETE ANYTHING
const { error: updateError } = await supabase
  .from("identity_documents")
  .update({ status: "expired_test" })
  .lt("created_at", cutoff);

if (updateError) {
  return Response.json(
    { error: updateError.message },
    { status: 500 }
  );
}

return Response.json({
  message: "TEST MODE: marked records only (no deletion)",
  cutoff,
});
  } catch (err) {
    return Response.json(
      { error: String(err) },
      { status: 500 }
    );
  }
});