"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// The sign-in part of the header: a "Sign in" link, or the visitor's email
// and a "Sign out" button.
//
// This is worked out in the browser, not on the server, on purpose. If the
// header asked the server who is signed in, every page would have to be
// rebuilt for every visitor, and the recipe list could no longer be built
// once and reused.
export default function AccountLink() {
  const router = useRouter();
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

  async function handleSignOut() {
    await createClient().auth.signOut();
    // Ask the server for the current page again, now signed out.
    router.refresh();
  }

  // Show nothing until we know, so "Sign in" doesn't flash up for a moment
  // for someone who is signed in.
  if (email === undefined) {
    return null;
  }

  if (email === null) {
    return (
      <Link href="/login" className="hover:underline">
        Sign in
      </Link>
    );
  }

  return (
    <span className="flex items-center gap-x-3">
      {/* The email is hidden on phones to keep the header on one line;
          "hidden sm:inline" means hidden, then shown from the sm width up.
          truncate cuts a long address off with "…". */}
      <span className="hidden max-w-48 truncate text-muted sm:inline">
        {email}
      </span>
      <button type="button" onClick={handleSignOut} className="hover:underline">
        Sign out
      </button>
    </span>
  );
}
