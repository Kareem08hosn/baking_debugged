"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// The account part of the header: "Sign in", or "Account" once signed in.
//
// This is worked out in the browser, not on the server, on purpose. If the
// header asked the server who is signed in, every page would have to be
// rebuilt for every visitor, and the recipe list could no longer be built
// once and reused.
export default function AccountLink() {
  const pathname = usePathname();
  // undefined = not known yet, null = signed out, text = the signed-in email
  const [email, setEmail] = useState(undefined);

  // useEffect runs code after the component appears on the page. It is for
  // connecting to things outside React, here Supabase's sign-in state.
  useEffect(() => {
    const supabase = createClient();
    // Supabase calls this function once straight away with the current
    // state, and again whenever someone signs in or out.
    // This email is only for display. Anything that matters is checked
    // again on the server.
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      // ?. stops and gives undefined if session is null; ?? null then
      // turns that into null
      setEmail(session?.user.email ?? null);
    });
    // The function returned from useEffect is the clean-up: React runs it
    // when the component is removed, so we stop listening.
    return () => data.subscription.unsubscribe();
    // [] means "run this once, when the component first appears"
  }, []);

  // Show nothing until we know, so "Sign in" doesn't flash up for a moment
  // for someone who is signed in.
  if (email === undefined) {
    return null;
  }

  // Signed out: "Sign in". Signed in: "Account" (sign out is on that page).
  // "Sign in" carries the current page along, so signing in brings you back
  const href = email === null ? "/login" : "/account";
  const linkHref =
    email === null && pathname !== "/login"
      ? `/login?next=${encodeURIComponent(pathname)}`
      : href;
  const isCurrent = pathname === href;
  return (
    // Marked like the other nav links when you're on that page
    <Link
      href={linkHref}
      aria-current={isCurrent ? "page" : undefined}
      className={isCurrent ? "highlight" : "hover:underline"}
    >
      {email === null ? "Sign in" : "Account"}
    </Link>
  );
}
