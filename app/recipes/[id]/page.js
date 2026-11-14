import Link from "next/link";
import { notFound } from "next/navigation";
import { recipes } from "@/lib/recipes";

// The folder is named [id], so this one file handles /recipes/1, /recipes/2...
// Next.js puts whatever is in the URL at that spot into params.id.
// params arrives as a Promise (a value that isn't ready yet), so the function
// is "async" and we "await" it before reading the id.
export default async function RecipePage({ params }) {
  const { id } = await params;

  // Values from a URL are always text ("3"), but our ids are numbers (3).
  // find() returns the first recipe that passes the test, or undefined.
  const recipe = recipes.find((recipe) => recipe.id === Number(id));

  // No recipe with that id (e.g. /recipes/999): show the 404 page instead.
  if (!recipe) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-2xl p-6">
      <Link href="/" className="text-gray-500 hover:underline">
        ← All recipes
      </Link>

      <h1 className="mt-4 text-3xl font-bold">{recipe.name}</h1>
      <p className="mb-6 text-gray-500">
        {recipe.category} · {recipe.difficulty} · {recipe.bakeTime} min · ★{" "}
        {recipe.rating}
      </p>

      <h2 className="text-xl font-semibold">Diet</h2>
      <p className="mb-6">{recipe.diet.join(", ")}</p>

      <h2 className="text-xl font-semibold">Ingredients</h2>
      <ul className="list-disc pl-6">
        {/* Ingredients are plain strings with no id, so the text is the key */}
        {recipe.ingredients.map((ingredient) => (
          <li key={ingredient}>{ingredient}</li>
        ))}
      </ul>
    </main>
  );
}
