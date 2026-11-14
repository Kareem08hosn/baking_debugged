// "@/" is a shortcut for the project root folder (set up in jsconfig.json)
import RecipeList from "@/components/RecipeList";
import { getRecipes } from "@/lib/recipes";

// Next.js keeps a finished copy of this page and serves that to visitors, so
// most visits don't touch the database at all. This number is how many
// seconds a copy may be reused before it is rebuilt with fresh data, so a
// change in the database shows up within a minute.
export const revalidate = 60;

// "async" lets the page wait for the database before it is drawn.
export default async function Home() {
  const recipes = await getRecipes();

  return (
    // className is JSX's word for the HTML "class" attribute.
    // These are Tailwind classes: each one applies a single CSS rule.
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <h1 className="mb-6 font-mono text-3xl font-bold">Recipes</h1>

      {/* Hand the data to RecipeList as a "prop" (like a function argument) */}
      <RecipeList recipes={recipes} />
    </main>
  );
}
