import PantrySearch from "@/components/PantrySearch";
import RecipeFinder from "@/components/ai/RecipeFinder";
import { getRecipes } from "@/lib/recipes";

export const metadata = {
  title: "Find a recipe",
  description:
    "Describe what you feel like baking, or type the ingredients you have, and get matching recipes.",
};

// Rebuilt at most once a minute, like the recipe list (see app/page.js).
export const revalidate = 60;

// Two ways to find a recipe on one page: describe it in words, or list what
// is in the kitchen. (/pantry used to be its own page; next.config.mjs sends
// old links here.)
export default async function FindPage() {
  const recipes = await getRecipes();

  return (
    <main className="page pt-6">
      <h1 className="page-title">
        <span className="highlight">Find a recipe</span>
      </h1>
      <p className="mt-4 max-w-xl text-lg">
        Describe what you feel like baking, or list what you have. Each match
        says why it fits.
      </p>

      <section aria-labelledby="describe-heading" className="mt-10">
        <h2 id="describe-heading" className="section-title">
          <span className="highlight">Describe it</span>
        </h2>
        <div className="mt-6">
          <RecipeFinder />
        </div>
      </section>

      <section aria-labelledby="pantry-heading" className="mt-20">
        <h2 id="pantry-heading" className="section-title">
          <span className="highlight">What can I make?</span>
        </h2>
        <p className="mt-3 max-w-xl text-lg">
          Tell it what you have. It finds recipes you can bake now, and the
          ones that need only a few more things.
        </p>
        <div className="mt-6">
          <PantrySearch recipes={recipes} />
        </div>
      </section>
    </main>
  );
}
