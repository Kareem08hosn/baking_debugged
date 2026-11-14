"use client";

import { useState } from "react";
import Link from "next/link";
import { toggleFavourite, useFavourites } from "@/lib/favourites";

// A bookmark-shaped "Save" button for one recipe. Saved recipes are stored
// in the person's account (lib/favourites.js) and get their own tab on
// /recipes. Signed-out visitors get a link to sign in instead.
export default function SaveButton({ recipeId }) {
  const { status, ids } = useFavourites();
  const [error, setError] = useState(null);
  const isSaved = ids.includes(recipeId);

  if (status === "signed-out") {
    return (
      <Link href={`/login?next=/recipes/${recipeId}`} className="btn-quiet">
        <BookmarkIcon filled={false} />
        Sign in to save
      </Link>
    );
  }

  async function handleClick() {
    setError(await toggleFavourite(recipeId));
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <button
        type="button"
        className="btn-quiet"
        // aria-pressed makes it a toggle: screen readers say "Save, pressed"
        aria-pressed={isSaved}
        // Disabled until we know whether it is saved, so it can't flicker
        disabled={status !== "ready"}
        onClick={handleClick}
      >
        <BookmarkIcon filled={isSaved} />
        {isSaved ? "Saved" : "Save"}
      </button>
      {/* "error" means the saved list couldn't be loaded at all */}
      {status === "error" && !error && (
        <span className="text-sm text-muted">Saving isn’t available right now.</span>
      )}
      {error && (
        <span role="alert" className="text-sm font-semibold">
          {error}
        </span>
      )}
    </span>
  );
}

// A filled bookmark when saved, an outline when not
function BookmarkIcon({ filled }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 3 H18 V21 L12 16 L6 21 Z" />
    </svg>
  );
}
