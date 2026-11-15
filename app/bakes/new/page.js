import Link from "next/link";
import SignInCard from "@/components/SignInCard";
import BakeForm from "@/components/bakes/BakeForm";
import { bakeFromRecipe } from "@/lib/bakes";
import { getRecipeChoices } from "@/lib/journal";
import { getOwnRecipe, getRecipeById } from "@/lib/recipes";
import { getUser } from "@/lib/supabase/server";

export const metadata = { title: "Log a bake" };

// /bakes/new, or /bakes/new?recipe=22 to start from a recipe.
export default async function NewBakePage({ searchParams }) {
  const { recipe: recipeId } = await searchParams;
  const user = await getUser();

  if (!user) {
    return (
      <main className="page max-w-3xl pt-6">
        <SignInCard title="Sign in to log bakes" text="Your bake log belongs to your account." />
      </main>
    );
  }

  const recipes = await getRecipeChoices();
  // ?? tries the site's recipes first, then the person's own
  const recipe = recipeId ? ((await getRecipeById(recipeId)) ?? (await getOwnRecipe(recipeId))) : null;

  return (
    <main className="page max-w-3xl pt-5">
      <Link href="/bakes" className="back-link">
        ← Bake log
      </Link>
      <h1 className="mt-5 page-title">
        <span className="highlight">Log a bake</span>
      </h1>
      <p className="mb-10 mt-4 max-w-xl text-lg">
        Only what you know is needed. The more you fill in, the more there is
        to learn from later.
      </p>
      <BakeForm recipes={recipes} prefill={recipe ? bakeFromRecipe(recipe) : null} />
    </main>
  );
}
