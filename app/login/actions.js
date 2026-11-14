// "use server" marks every function in this file as a server action: a
// function the browser can call, but which runs on the server. The form in
// LoginForm.js calls sendMagicLink when it is submitted.
"use server";

import { cookies } from "next/headers";
import { NEXT_COOKIE, safeNextPath } from "@/lib/safeNext";
import { createClient } from "@/lib/supabase/server";

// previousState is whatever this function returned last time (see
// useActionState in LoginForm.js). formData holds the form's fields.
export async function sendMagicLink(previousState, formData) {
  // Never trust what a form sends: check it again on the server.
  const email = String(formData.get("email") ?? "").trim();
  if (!email.includes("@")) {
    return { status: "error", message: "Enter a valid email address." };
  }

  const supabase = await createClient();
  // Despite the name (OTP = one-time password), this emails a sign-in link.
  // A first-time email address gets an account created automatically.
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });

  if (error) {
    // The details go to the server log, not to the visitor.
    console.error("Magic link failed:", error.message);
    // 429 is the standard "too many requests" code
    if (error.status === 429) {
      return {
        status: "error",
        message: "Too many requests. Wait a minute, then try again.",
      };
    }
    return {
      status: "error",
      message: "The link couldn’t be sent. Try again in a moment.",
    };
  }

  // Remember where to go after the emailed link is opened (app/auth/confirm
  // reads this). A cookie, because the link in the email always points to
  // the same address and can't carry it. It expires after an hour, like the
  // link itself.
  const next = safeNextPath(String(formData.get("next") ?? ""));
  const cookieStore = await cookies();
  cookieStore.set(NEXT_COOKIE, next, {
    httpOnly: true, // JavaScript in the page can't read it
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });

  return { status: "sent", email };
}
