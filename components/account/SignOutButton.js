"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();

  async function handleClick() {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh(); // redraw the pages as a signed-out visitor
  }

  return (
    <button type="button" className="btn-quiet" onClick={handleClick}>
      Sign out
    </button>
  );
}
