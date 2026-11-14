// "@/" is a shortcut for the project root folder (set up in jsconfig.json)
import RecipeList from "@/components/RecipeList";
import { recipes } from "@/lib/recipes";

export default function Home() {
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
