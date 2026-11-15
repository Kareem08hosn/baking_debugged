import Link from "next/link";
import RecipeDetail from "@/components/RecipeDetail";
import UserRecipe from "@/components/UserRecipe";
import { getRecipeById } from "@/lib/recipes";
import { jsonLdText, recipeJsonLd } from "@/lib/recipeSchema";
import { SITE_URL } from "@/lib/site";

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
    <main className="page pt-5">
      {/* Recipe data for search engines (lib/recipeSchema.js). Only for the
          site's own recipes: private ones aren't shown to search engines. */}
      {recipe && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdText(recipeJsonLd(recipe, `${SITE_URL}/recipes/${recipe.id}`)) }}
        />
      )}
      <Link href="/recipes" className="back-link print:hidden">
        ← All recipes
      </Link>

      {/* condition ? a : b means "if condition then a, otherwise b".
          Recipes from the database are drawn here on the server. Any other
          id might be someone's own (private) recipe, so UserRecipe looks
          for it in the browser, where the sign-in cookie is. */}
      {recipe ? <RecipeDetail recipe={recipe} /> : <UserRecipe id={id} />}
    </main>
  );
}
