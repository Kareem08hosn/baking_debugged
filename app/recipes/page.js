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
    <main className="page pt-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div>
          <h1 className="font-mono text-[clamp(2.6rem,11vw,4.5rem)] font-extrabold leading-none tracking-[-0.05em]">
            <span className="highlight">Recipes</span>
          </h1>
          <p className="mt-3 max-w-xl text-lg">
            Every bake measured in grams. Each one scales to your servings or
            pan, and converts to cups.
          </p>
          <p className="hand mt-2 -rotate-1 text-muted">
            dashed stamp = adapted, not test-baked here yet
          </p>
        </div>
        <Link href="/recipes/new" className="btn-paper">
          Add a recipe
        </Link>
      </div>

      {/* Hand the data to RecipeList as a "prop" (like a function argument) */}
      <RecipeList recipes={recipes} />
    </main>
  );
}
