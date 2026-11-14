// A Supabase client for code running in the browser (client components).
// It reads the sign-in cookie straight from the browser.
import { createBrowserClient } from "@supabase/ssr";
import { supabaseKey, supabaseUrl } from "@/lib/supabase/config";

// createBrowserClient hands back the same client every time it is called in
// the browser, so calling this from several components is cheap.
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseKey);
}
