"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RecipeDetail from "@/components/RecipeDetail";
import { deleteRecipe } from "@/app/recipes/actions";
import { fetchMyRecipe } from "@/lib/myRecipes";

// Shows a recipe that isn't one of the site's own: the server couldn't find
// it, so it must be private. It is looked for among the signed-in person's
// recipes, in the browser, where the sign-in cookie is.
export default function UserRecipe({ id }) {
  const router = useRouter();
  // What the database said: undefined = still asking, null = not there
  const [recipe, setRecipe] = useState(undefined);
  // The delete flow: "idle", "confirming" (asking "are you sure?"),
  // "deleting", or an error message
  const [deleteState, setDeleteState] = useState("idle");

  useEffect(() => {
    let ignore = false;
    fetchMyRecipe(id).then((recipe) => {
      if (!ignore) {
        setRecipe(recipe);
      }
    });
    return () => {
      ignore = true;
    };
  }, [id]);

  if (recipe === undefined) {
    return <p className="mt-6 font-mono text-muted">Loading the recipe…</p>;
  }

  if (!recipe) {
    return (
      <div className="note note-ruled tape mx-auto mt-10 max-w-md -rotate-1 px-5 pb-6 pt-8">
        <h1 className="font-mono text-2xl font-bold leading-7">Recipe not found</h1>
        <p className="mt-2 leading-7">
          There’s no recipe at this address that you can see. Your own recipes
          only show up when you’re signed in.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/recipes" className="btn">
            Browse the recipes
          </Link>
          <Link href={`/login?next=/recipes/${id}`} className="btn-paper">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  async function handleDelete() {
    setDeleteState("deleting");
    const result = await deleteRecipe(recipe.id);
    if (result.error) {
      setDeleteState(result.error);
      return;
    }
    router.push("/recipes");
  }

  return (
    <>
      <RecipeDetail recipe={recipe} />

      <div className="mt-14 flex flex-wrap items-center gap-x-4 gap-y-3 border-t-[1.5px] border-dashed border-foreground pt-5">
        <p className="text-sm text-muted">Your recipe. Only you can see it.</p>

        {deleteState === "idle" && (
          <Link href={`/recipes/${recipe.id}/edit`} className="btn-quiet">
            Edit this recipe
          </Link>
        )}

        {/* Deleting can't be undone, so the first click only asks. */}
        {deleteState === "idle" && (
          <button type="button" className="btn-quiet" onClick={() => setDeleteState("confirming")}>
            Delete this recipe
          </button>
        )}
        {(deleteState === "confirming" || deleteState === "deleting") && (
          <span className="flex flex-wrap items-center gap-3" role="group" aria-label="Confirm delete">
            <span className="font-mono text-sm font-bold">Delete it for good?</span>
            <button
              type="button"
              className="btn-quiet"
              disabled={deleteState === "deleting"}
              onClick={handleDelete}
            >
              {deleteState === "deleting" ? "Deleting…" : "Yes, delete"}
            </button>
            <button
              type="button"
              className="font-mono text-sm underline underline-offset-4"
              onClick={() => setDeleteState("idle")}
            >
              Keep it
            </button>
          </span>
        )}
        {/* Anything else is an error message from the server */}
        {!["idle", "confirming", "deleting"].includes(deleteState) && (
          <p role="alert" className="alert">
            {deleteState}
          </p>
        )}
      </div>
    </>
  );
}
