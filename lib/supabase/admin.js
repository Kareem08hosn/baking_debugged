// A Supabase client with the SECRET key: it skips every Row Level Security
// policy, so it can do anything. SERVER ONLY. It is used for exactly two
// things nobody else may touch: the shared AI answer cache and the daily AI
// limits (lib/ai/store.js).
//
// SUPABASE_SECRET_KEY must never get a NEXT_PUBLIC_ name, never be logged,
// never be committed. Find it in Supabase: Project Settings -> API keys.
import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "@/lib/supabase/config";

export function createAdminClient() {
  // A browser has a "window"; the server doesn't. Refuse to run there.
  if (typeof window !== "undefined") {
    throw new Error("The admin client must never run in the browser");
  }
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) {
    throw new Error("SUPABASE_SECRET_KEY is not set");
  }
  // persistSession: false, because a server has no sign-in to remember
  return createClient(supabaseUrl, key, { auth: { persistSession: false } });
}
