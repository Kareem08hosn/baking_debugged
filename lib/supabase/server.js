// A Supabase client for server code that needs to know who is signed in:
// server actions, route handlers and server components.
//
// Being signed in means the browser holds a cookie containing a token that
// proves who the visitor is. The browser sends its cookies with every
// request, and this client reads the token from them.
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseKey, supabaseUrl } from "@/lib/supabase/config";

// A new client must be made for every request, because every request carries
// a different visitor's cookies. That is why this is a function, not a shared
// object like the one in public.js.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseKey, {
    // Supabase doesn't know about Next.js, so we tell it how to read and
    // write cookies here.
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server components aren't allowed to set cookies, so this fails
          // when called from one. That is fine: proxy.js keeps the cookie
          // fresh on every request anyway.
        }
      },
    },
  });
}

// Returns the signed-in visitor as { id, email }, or null if nobody is.
// getClaims() checks the token's signature, so the answer can be trusted.
// (getSession() only reads the cookie without checking it: never use it to
// decide what someone is allowed to do.)
export async function getUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data) {
    return null;
  }
  // "sub" (subject) is the standard name for the user's id inside a token.
  return { id: data.claims.sub, email: data.claims.email };
}
