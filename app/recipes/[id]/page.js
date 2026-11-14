import Link from "next/link";
import RecipeDetail from "@/components/RecipeDetail";
import SavedRecipe from "@/components/SavedRecipe";
import { getRecipeById } from "@/lib/recipes";

// Next.js calls this to fill in the page's <title> (the browser tab text).
// It gets the same params as the page, so each recipe gets its own title.
export async function generateMetadata({ params }) {
  const { id } = await params;
  const recipe = await getRecipeById(id);

  // layout.js adds " | Baking Debugged" after this. Recipes saved in the
  // browser aren't known to the server, so they get a general title.
  return { title: recipe ? recipe.name : "Recipe" };
}

// The folder is named [id], so this one file handles /recipes/1, /recipes/2...
// Next.js puts whatever is in the URL at that spot into params.id.
// params arrives as a Promise (a value that isn't ready yet), so the function
// is "async" and we "await" it before reading the id.
export default async function RecipePage({ params }) {
  const { id } = await params;
  const recipe = await getRecipeById(id);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <Link href="/" className="font-mono text-sm text-muted hover:underline">
        ← All recipes
      </Link>

      {/* condition ? a : b means "if condition then a, otherwise b".
          Recipes from the database are drawn here on the server. Any other
          id might be a recipe saved in the visitor's browser, so SavedRecipe
          checks there. */}
      {recipe ? <RecipeDetail recipe={recipe} /> : <SavedRecipe id={id} />}
    </main>
  );
}
