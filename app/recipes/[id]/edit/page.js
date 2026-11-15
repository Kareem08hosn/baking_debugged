import Link from "next/link";
import { notFound } from "next/navigation";
import AddRecipeForm from "@/components/AddRecipeForm";
import SignInCard from "@/components/SignInCard";
import { getOwnRecipe } from "@/lib/recipes";
import { getUser } from "@/lib/supabase/server";

export const metadata = { title: "Edit recipe" };

// /recipes/12/edit: the add-recipe form, filled in with one of your own
// recipes. Only the owner gets here; anyone else sees the 404 page.
export default async function EditRecipePage({ params }) {
  const { id } = await params;
  const user = await getUser();

  if (!user) {
    return (
      <main className="page max-w-3xl pt-6">
        <SignInCard title="Sign in to edit your recipes" text="Your recipes belong to your account." />
      </main>
    );
  }

  const recipe = await getOwnRecipe(id);
  if (!recipe) {
    notFound(); // shows app/not-found.js
  }

  return (
    <main className="page max-w-3xl pt-5">
      <Link href={`/recipes/${recipe.id}`} className="back-link">
        ← Back to the recipe
      </Link>
      <h1 className="mt-5 page-title">
        <span className="highlight">Edit recipe</span>
      </h1>
      <p className="mb-10 mt-4 max-w-xl text-lg">
        Change anything, then save. The recipe keeps its address, so links
        to it still work.
      </p>
      {/* key: if you go straight from editing one recipe to another, React
          starts a fresh form instead of reusing the old one's state */}
      <AddRecipeForm key={recipe.id} recipe={recipe} />
    </main>
  );
}
