// The sign-in link in the email points here:
//   /auth/confirm?token_hash=...&type=email
//
// A file named route.js is a "route handler": it answers a URL with code
// instead of a page. This one checks the one-time token with Supabase. If it
// is good, Supabase sets the sign-in cookie and we send the visitor to the
// homepage, signed in.
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// The kinds of email link we accept. "signup" and "magiclink" are the names
// Supabase's older email templates use.
const ALLOWED_TYPES = ["email", "signup", "magiclink"];

// GET is the kind of request a browser makes when you click a link.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  if (tokenHash && ALLOWED_TYPES.includes(type)) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) {
      redirect("/");
    }
  }

  // Missing, expired or already-used token.
  redirect("/login?error=link");
}
