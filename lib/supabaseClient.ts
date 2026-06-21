import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase environmental parameters are missing! " +
    "Please check that NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is set in your .env.local file and restart your server."
  );
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");