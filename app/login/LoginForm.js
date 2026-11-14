"use client";

import { useActionState } from "react";
import { sendMagicLink } from "./actions";

// "next" is the page to return to after signing in (from /login?next=...).
export default function LoginForm({ next = "/" }) {
  // useActionState connects a form to a server action.
  //   state      what the action returned last (starts as { status: "idle" })
  //   formAction what to put on the <form> so submitting calls the action
  //   isPending  true while the action is running
  const [state, formAction, isPending] = useActionState(sendMagicLink, {
    status: "idle",
  });

  if (state.status === "sent") {
    return (
      // role="status" makes screen readers announce this when it appears
      <div role="status" className="note tape px-5 pb-6 pt-8">
        {/* An envelope drawn in pen */}
        <svg viewBox="0 0 64 44" className="h-11 w-16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="3" width="58" height="38" rx="3" />
          <path d="M4 5 L32 26 L60 5" />
        </svg>
        <p className="mt-4 font-mono text-lg font-bold">Check your email</p>
        <p className="mt-1.5 break-words">
          A sign-in link is on its way to <b>{state.email}</b>. It works once
          and expires after an hour. Open it in this browser.
        </p>
      </div>
    );
  }

  return (
    // action={formAction}: the browser sends the form's fields to the server
    // action. No onSubmit or preventDefault is needed.
    <form action={formAction} className="note tape grid gap-5 px-5 pb-6 pt-8">
      {/* A hidden field sends "next" along with the email */}
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="login-email" className="label block">
          Email
        </label>
        <input
          id="login-email"
          className="field mt-1.5"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
      </div>

      {/* role="alert" makes screen readers announce the message */}
      {state.status === "error" && (
        <p role="alert" className="alert">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="btn justify-self-start"
      >
        {isPending ? "Sending…" : "Email me a sign-in link"}
      </button>
    </form>
  );
}
