import PantrySearch from "@/components/PantrySearch";
import { getRecipes } from "@/lib/recipes";

export const metadata = {
  title: "What can I make?",
  description: "Type the ingredients you have and see which recipes you can bake, and what's missing.",
};

// Rebuilt at most once a minute, like the recipe list (see app/page.js).
export const revalidate = 60;

export default async function PantryPage() {
  const recipes = await getRecipes();

  return (
    <main className="page pt-6">
      <h1 className="page-title">
        <span className="highlight">What can I make?</span>
      </h1>
      <p className="mt-4 max-w-xl text-lg">
        Tell it what you have. It finds recipes you can bake now, and the
        ones that need only a few more things.
      </p>
      <div className="mt-10">
        <PantrySearch recipes={recipes} />
      </div>
    </main>
  );
}
