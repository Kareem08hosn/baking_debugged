"use client";

import { useState } from "react";
import { createRecipe } from "@/app/recipes/actions";
import { deleteSavedRecipe, useSavedRecipes } from "@/lib/savedRecipes";

// Offers to move recipes saved in this browser (before accounts existed)
// into the signed-in person's account. Shows nothing if there are none.
export default function MoveLocalRecipes() {
  const localRecipes = useSavedRecipes(); // null until loaded
  // "idle", "moving", or a message about how it went
  const [status, setStatus] = useState("idle");

  if (!localRecipes || (localRecipes.length === 0 && status === "idle")) {
    return null;
  }

  async function moveAll() {
    setStatus("moving");
    let moved = 0;
    const failed = [];
    // One at a time, so a problem with one doesn't stop the others.
    // for...of with await waits for each save before starting the next.
    for (const recipe of localRecipes) {
      const result = await createRecipe(recipe);
      if (result.error) {
        failed.push(`${recipe.name}: ${result.error}`);
      } else {
        deleteSavedRecipe(recipe.id); // only remove it once it's saved
        moved += 1;
      }
    }
    const summary = `Moved ${moved} ${moved === 1 ? "recipe" : "recipes"} to your account.`;
    setStatus(failed.length > 0 ? `${summary} Not moved: ${failed.join(" ")}` : summary);
  }

  const count = localRecipes.length;

  return (
    <div className="note mb-10 px-5 py-5" role="region" aria-label="Recipes saved in this browser">
      {status === "idle" || status === "moving" ? (
        <>
          <p className="font-mono font-bold">
            {count} {count === 1 ? "recipe" : "recipes"} saved in this browser
          </p>
          <p className="mt-1.5">
            You added {count === 1 ? "it" : "them"} before accounts existed.
            Move {count === 1 ? "it" : "them"} to your account to keep{" "}
            {count === 1 ? "it" : "them"} safe and see {count === 1 ? "it" : "them"} on any device.
          </p>
          <button
            type="button"
            className="btn-quiet mt-3"
            disabled={status === "moving"}
            onClick={moveAll}
          >
            {status === "moving" ? "Moving…" : `Move ${count === 1 ? "it" : `all ${count}`} to my account`}
          </button>
        </>
      ) : (
        // role="status" announces the result to screen readers
        <p role="status">{status}</p>
      )}
    </div>
  );
}
