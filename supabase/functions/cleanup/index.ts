import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const CUT_OFF_MINUTES = 60; // 1 hour

const BUCKET = "identity-docs";

Deno.serve(async () => {
  try {
    const cutoff = new Date(
      Date.now() - CUT_OFF_MINUTES * 60 * 1000
    ).toISOString();

    // 1. Get expired files
    const { data: records, error } = await supabase
      .from("identity_documents")
      .select("id, file_path")
      .lt("created_at", cutoff);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    if (!records?.length) {
      return Response.json({ message: "Nothing to delete" });
    }

    const ids = records.map(r => r.id);
    const paths = records.map(r => r.file_path);
    console.log("BUCKET:", BUCKET);
    console.log("PATHS:", paths);
    await supabase.storage.from(BUCKET).list();

    // 2. Delete from storage
    const { error: storageError } = await supabase.storage
      .from(BUCKET)
      .remove(paths);

    if (storageError) {
      return Response.json(
        { error: "Storage delete failed", details: storageError.message },
        { status: 500 }
      );
    }

    // 3. Delete DB rows
    await supabase
      .from("identity_documents")
      .delete()
      .in("id", ids);

    return Response.json({
      message: "Cleanup completed",
      deleted: ids.length
    });

  } catch (err) {
    return Response.json(
      { error: String(err) },
      { status: 500 }
    );
  }
});