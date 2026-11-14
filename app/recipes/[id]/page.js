import Link from "next/link";
import { notFound } from "next/navigation";
import { formatIngredient, getRecipeById } from "@/lib/recipes";

// Next.js calls this to fill in the page's <title> (the browser tab text).
// It gets the same params as the page, so each recipe gets its own title.
export async function generateMetadata({ params }) {
  const { id } = await params;
  const recipe = getRecipeById(id);

  // Unknown id: return nothing and let the page below show the 404.
  if (!recipe) {
    return {};
  }
  // layout.js adds " | Baking Debugged" after this.
  return { title: recipe.name };
}

// The folder is named [id], so this one file handles /recipes/1, /recipes/2...
// Next.js puts whatever is in the URL at that spot into params.id.
// params arrives as a Promise (a value that isn't ready yet), so the function
// is "async" and we "await" it before reading the id.
export default async function RecipePage({ params }) {
  const { id } = await params;
  const recipe = getRecipeById(id);

  // No recipe with that id (e.g. /recipes/999): show the 404 page instead.
  if (!recipe) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-2xl p-6">
      <Link href="/" className="text-muted hover:underline">
        ← All recipes
      </Link>

      <h1 className="mt-4 text-3xl font-bold">{recipe.name}</h1>
      <p className="text-muted">
        {recipe.category} · {recipe.difficulty} · ★ {recipe.rating} ·{" "}
        {recipe.diet.join(", ")}
      </p>
      <p className="mb-6">
        Serves {recipe.servings} · Prep {recipe.prepTime} min · Bake{" "}
        {recipe.bakeTime} min
      </p>

      <h2 className="text-xl font-semibold">Ingredients</h2>
      <ul className="mb-6 list-disc pl-6">
        {/* Ingredients have no id, so the name is the key */}
        {recipe.ingredients.map((ingredient) => (
          <li key={ingredient.name}>{formatIngredient(ingredient)}</li>
        ))}
      </ul>

      <h2 className="text-xl font-semibold">Instructions</h2>
      {/* <ol> is an ordered list: the browser numbers the steps for us */}
      <ol className="list-decimal space-y-2 pl-6">
        {recipe.instructions.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </main>
  );
}
