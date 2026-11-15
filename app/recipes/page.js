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
      {/* On phones this stacks: title, one sentence, then the three links on
          ONE line, so the recipes start as high up the screen as possible.
          From "sm" up the links sit to the right of the title. */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div>
          <h1 className="page-title">
            <span className="highlight">Recipes</span>
          </h1>
          <p className="mt-3 max-w-xl text-lg">
            Every bake measured in grams. Each one scales to your servings or
            pan, and converts to cups.
          </p>
          {/* A margin note: decoration, so phones skip it to save a line */}
          <p className="hand mt-2 -rotate-1 text-muted max-sm:hidden">
            dashed stamp = adapted, not test-baked here yet
          </p>
        </div>
        {/* Other ways in. Plain links, not buttons, so all three fit one row
            on a phone. min-h-9 keeps each one tall enough to tap (36px). */}
        <nav
          aria-label="Other ways to find or add a recipe"
          className="flex flex-wrap gap-x-4 text-[0.8125rem]"
        >
          <Link href="/find" className="link inline-flex min-h-9 items-center">
            Find by description or pantry
          </Link>
          <Link href="/recipes/new" className="link inline-flex min-h-9 items-center">
            Add a recipe
          </Link>
        </nav>
      </div>

      {/* Hand the data to RecipeList as a "prop" (like a function argument) */}
      <RecipeList recipes={recipes} />
    </main>
  );
}
