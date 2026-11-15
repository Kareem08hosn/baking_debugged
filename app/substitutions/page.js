import Link from "next/link";
import SubstitutionFinder from "@/components/ai/SubstitutionFinder";
import { isAiEnabled } from "@/lib/ai/config";
import { getRecipeById } from "@/lib/recipes";

export const metadata = {
  title: "Substitutions",
  description: "What to use instead of an ingredient, how much, and the chemistry of why it works or doesn't.",
};

// /substitutions, or /substitutions?recipe=22 coming from a recipe page.
export default async function SubstitutionsPage({ searchParams }) {
  const { recipe: recipeId, ingredient = "" } = await searchParams;
  const recipe = recipeId ? await getRecipeById(recipeId) : null;

  return (
    <main className="page pt-6">
      {recipe && (
        <Link href={`/recipes/${recipe.id}`} className="back-link">
          ← {recipe.name}
        </Link>
      )}
      <h1 className="mt-2 page-title">
        <span className="highlight">Substitutions</span>
      </h1>
      <p className="mt-4 max-w-xl text-lg">
        Out of something? Find what to use instead, how much, and what it
        will change.
      </p>
      <div className="mt-10">
        <SubstitutionFinder
          aiEnabled={isAiEnabled()}
          recipe={recipe ? { id: recipe.id, name: recipe.name, ingredients: recipe.ingredients } : null}
          initialIngredient={String(ingredient).slice(0, 60)}
        />
      </div>
    </main>
  );
}
