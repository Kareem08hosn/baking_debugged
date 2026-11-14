// The two values every Supabase client needs. They come from .env.local (on
// this computer) or the hosting settings (once deployed), not from the code,
// so the same code can point at a different database without being edited.
//
// Names starting with NEXT_PUBLIC_ are allowed to reach the browser. That is
// safe for these two: the publishable key only lets someone do what the
// database's Row Level Security policies allow. The SECRET key must never be
// given a NEXT_PUBLIC_ name or put in this project.
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Supabase is not set up: add NEXT_PUBLIC_SUPABASE_URL and " +
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local, then restart the dev server."
  );
}
