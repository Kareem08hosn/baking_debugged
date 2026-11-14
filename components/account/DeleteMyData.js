"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteMyData } from "@/app/account/actions";

// "Delete my data": two steps (open, then type DELETE) because it can't be
// undone.
export default function DeleteMyData() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [status, setStatus] = useState("idle"); // "idle", "deleting", "done" or an error

  async function handleDelete(event) {
    event.preventDefault();
    setStatus("deleting");
    const result = await deleteMyData(typed);
    if (result.error) {
      setStatus(result.error);
      return;
    }
    setStatus("done");
    setTyped("");
    router.refresh();
  }

  if (status === "done") {
    return (
      <p role="status" className="font-mono">
        Done. Everything you’d stored has been deleted.
      </p>
    );
  }

  if (!isOpen) {
    return (
      <button type="button" className="btn-quiet" onClick={() => setIsOpen(true)}>
        Delete my data
      </button>
    );
  }

  return (
    <form onSubmit={handleDelete} className="note max-w-md px-5 py-5">
      <p className="font-mono font-bold">Delete everything you’ve stored?</p>
      <p className="mt-1.5 text-sm">
        Your recipes, saved recipes, bakes, notes and preferences will be
        permanently deleted. This can’t be undone. Export your bake log first
        if you want to keep it.
      </p>
      <label htmlFor="delete-confirm" className="label mt-4 block">
        Type DELETE to confirm
      </label>
      <input
        id="delete-confirm"
        className="field mt-1 font-mono"
        value={typed}
        onChange={(event) => setTyped(event.target.value)}
        autoComplete="off"
      />
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="submit" className="btn" disabled={typed !== "DELETE" || status === "deleting"}>
          {status === "deleting" ? "Deleting…" : "Delete my data"}
        </button>
        <button
          type="button"
          className="font-mono text-sm underline underline-offset-4"
          onClick={() => {
            setIsOpen(false);
            setTyped("");
            setStatus("idle");
          }}
        >
          Keep it
        </button>
      </div>
      {!["idle", "deleting"].includes(status) && (
        <p role="alert" className="alert mt-4">{status}</p>
      )}
    </form>
  );
}
