import RecipeList from "./RecipeList";
// "@/" is a shortcut for the project root folder (set up in jsconfig.json)
import { recipes } from "@/lib/recipes";

export default function Home() {
  return (
    // className is JSX's word for the HTML "class" attribute.
    // These are Tailwind classes: each one applies a single CSS rule.
    <main className="mx-auto w-full max-w-2xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Baking Debugged</h1>

      {/* Hand the data to RecipeList as a "prop" (like a function argument) */}
      <RecipeList recipes={recipes} />
    </main>
  );
}
