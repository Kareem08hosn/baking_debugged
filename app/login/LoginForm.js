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
      <div className="rounded-lg border border-line bg-surface p-4">
        <p className="font-semibold">Check your email</p>
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
    <form action={formAction} className="space-y-4">
      <label className="block font-semibold">
        Email
        <input
          className="mt-1 w-full rounded border border-line bg-surface p-2 font-normal"
          type="email"
          name="email"
          autoComplete="email"
          required
        />
      </label>

      {/* role="alert" makes screen readers announce the message */}
      {state.status === "error" && (
        <p role="alert" className="rounded border border-foreground p-2 font-semibold">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-foreground px-4 py-2 font-mono font-bold text-background hover:opacity-90 disabled:opacity-60"
      >
        {isPending ? "Sending…" : "Email me a sign-in link"}
      </button>
    </form>
  );
}
