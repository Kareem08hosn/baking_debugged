import Link from "next/link";
import RecipeList from "@/components/RecipeList";
import { getRecipes } from "@/lib/recipes";

// The text for the browser tab: "Recipes | Baking Debugged"
export const metadata = { title: "Recipes" };

// Rebuilt at most once a minute, like the homepage (see app/page.js).
export const revalidate = 60;

// The full recipe list, at /recipes.
export default async function RecipesPage() {
  const recipes = await getRecipes();

  return (
    <main className="page pt-5">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <h1 className="font-mono text-[2.5rem] font-extrabold leading-tight tracking-[-0.045em] sm:text-[3.25rem]">
          <span className="highlight">Recipes</span>
        </h1>
        <Link href="/recipes/new" className="btn-quiet mb-2">
          + Add a recipe
        </Link>
      </div>
      <p className="mb-4 mt-1.5 max-w-xl text-muted">
        Notes from the bench. Every bake measured in grams, with what worked
        and what didn’t.
      </p>

      {/* Hand the data to RecipeList as a "prop" (like a function argument) */}
      <RecipeList recipes={recipes} />
    </main>
  );
}
