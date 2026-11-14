// The proxy runs on the server before each page request (Next.js used to
// call this file "middleware"). Its only job here is to keep a signed-in
// visitor signed in.
//
// The sign-in token inside the cookie expires after about an hour. Supabase
// can swap it for a fresh one, and this is the one place on the server that
// is allowed to save the new cookie before the page is built.
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { supabaseKey, supabaseUrl } from "@/lib/supabase/config";

export async function proxy(request) {
  // Supabase's cookies all start with "sb-". A visitor without one isn't
  // signed in, so there is nothing to refresh: carry on to the page.
  const hasAuthCookie = request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith("sb-"));
  if (!hasAuthCookie) {
    return NextResponse.next();
  }

  // "Carry on to the page", as a response we can attach cookies to.
  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      // Called when Supabase has a fresh token to save.
      setAll(cookiesToSet, headers) {
        // 1. Put it on the request, so the page being built sees the new one.
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        // 2. Put it on the response, so the browser saves the new one.
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        // 3. Headers telling caches never to store this response: it now
        //    contains one person's sign-in cookie.
        for (const [name, value] of Object.entries(headers)) {
          response.headers.set(name, value);
        }
      },
    },
  });

  // Checks the token and refreshes it if it has expired (calling setAll above).
  await supabase.auth.getClaims();

  return response;
}

// Which requests the proxy runs on: everything except Next.js's own files and
// images, which never need to know who is signed in.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|brand/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
