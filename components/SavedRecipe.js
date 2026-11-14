"use client";

import { useRouter } from "next/navigation";
import RecipeDetail from "@/components/RecipeDetail";
import { deleteSavedRecipe, useSavedRecipes } from "@/lib/savedRecipes";

// Shows a recipe that was added through the form. Those live in this
// browser's localStorage, so the server can't draw them: this component
// looks the recipe up in the browser instead.
export default function SavedRecipe({ id }) {
  // useRouter lets code change page (a link you can "click" from JavaScript).
  const router = useRouter();
  const savedRecipes = useSavedRecipes();

  // null means the browser hasn't loaded the saved recipes yet.
  if (savedRecipes === null) {
    return <p className="mt-4 text-muted">Loading…</p>;
  }

  const recipe = savedRecipes.find((recipe) => recipe.id === Number(id));

  if (!recipe) {
    return (
      <>
        <h1 className="mt-4 font-mono text-3xl font-bold">Recipe not found</h1>
        <p className="text-muted">
          There is no recipe at this address. Recipes you add are saved in the
          browser you added them with.
        </p>
      </>
    );
  }

  function handleDelete() {
    // confirm() shows the browser's OK / Cancel box and returns true for OK.
    if (window.confirm(`Delete "${recipe.name}"? This can't be undone.`)) {
      deleteSavedRecipe(recipe.id);
      router.push("/");
    }
  }

  return (
    <>
      <RecipeDetail recipe={recipe} />
      <p className="mt-8 text-sm text-muted">
        You added this recipe. It is saved in this browser only.
      </p>
      <button
        type="button"
        onClick={handleDelete}
        className="mt-2 rounded border border-line bg-surface px-3 py-1 font-mono text-sm hover:border-foreground"
      >
        Delete this recipe
      </button>
    </>
  );
}
