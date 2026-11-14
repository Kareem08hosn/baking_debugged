"use client";

import { useActionState } from "react";
import { sendMagicLink } from "./actions";

export default function LoginForm() {
  // useActionState connects a form to a server action.
  //   state      what the action returned last (starts as { status: "idle" })
  //   formAction what to put on the <form> so submitting calls the action
  //   isPending  true while the action is running
  const [state, formAction, isPending] = useActionState(sendMagicLink, {
    status: "idle",
  });

  if (state.status === "sent") {
    return (
      <div className="note tape px-4 pb-4 pt-6">
        <p className="font-mono font-bold">Check your email</p>
        <p className="mt-1 text-muted">
          A sign-in link is on its way to {state.email}. It works once and
          expires after an hour. Open it in this browser.
        </p>
      </div>
    );
  }

  return (
    // action={formAction}: the browser sends the form's fields to the server
    // action. No onSubmit or preventDefault is needed.
    <form action={formAction} className="note tape space-y-4 px-4 pb-5 pt-7">
      <label className="label block">
        Email
        <input
          className="field mt-1"
          type="email"
          name="email"
          autoComplete="email"
          required
        />
      </label>

      {/* role="alert" makes screen readers announce the message */}
      {state.status === "error" && (
        <p role="alert" className="alert">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="btn"
      >
        {isPending ? "Sending…" : "Email me a sign-in link"}
      </button>
    </form>
  );
}
