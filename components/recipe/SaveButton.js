"use client";

import { toggleBookmark, useBookmarks } from "@/lib/bookmarks";

// A bookmark-shaped "Save" button for one recipe. Saved recipes get their
// own tab on /recipes.
export default function SaveButton({ recipeId }) {
  const bookmarks = useBookmarks();
  // Until the browser has loaded the list, draw the button as not saved but
  // disabled, so the page doesn't jump when it loads.
  const isLoaded = bookmarks !== null;
  const isSaved = isLoaded && bookmarks.includes(recipeId);

  return (
    <button
      type="button"
      className="btn-quiet"
      // aria-pressed makes it a toggle: screen readers say "Save, pressed"
      aria-pressed={isSaved}
      disabled={!isLoaded}
      onClick={() => toggleBookmark(recipeId)}
    >
      <svg
        viewBox="0 0 24 24"
        className="size-4"
        // A filled bookmark when saved, an outline when not
        fill={isSaved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6 3 H18 V21 L12 16 L6 21 Z" />
      </svg>
      {isSaved ? "Saved" : "Save"}
    </button>
  );
}
