import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "jsr:@supabase/server@^1";

console.info("cleanup worker started");

export default {
  fetch: withSupabase({ auth: false }, async (_req, ctx) => {
    const cutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString();

    const { data, error } = await ctx.supabase
      .from("identity_documents")
      .select("file_path")
      .lt("created_at", cutoff);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return Response.json({ message: "No files to delete" });
    }

    const paths = data.map((f: any) => f.file_path);

    const { error: storageError } = await ctx.supabase.storage
      .from("identity-docs")
      .remove(paths);

    if (storageError) {
      return Response.json({ error: storageError.message }, { status: 500 });
    }

    await ctx.supabase
      .from("identity_documents")
      .delete()
      .lt("created_at", cutoff);

    return Response.json({
      deleted: paths.length,
      cutoff,
    });
  }),
};