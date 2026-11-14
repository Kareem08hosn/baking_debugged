import Link from "next/link";
import { notFound } from "next/navigation";
import AddRecipeForm from "@/components/AddRecipeForm";
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
      <main className="page max-w-3xl pt-10">
        <div className="note note-ruled tape max-w-md -rotate-1 px-5 pb-6 pt-8">
          <p className="font-mono text-lg font-bold leading-7">Sign in to edit your recipes</p>
          <p className="leading-7">Your recipes belong to your account.</p>
          <Link href="/login" className="btn mt-4">
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  const recipe = await getOwnRecipe(id);
  if (!recipe) {
    notFound(); // shows app/not-found.js
  }

  return (
    <main className="page max-w-3xl pt-5">
      <Link href={`/recipes/${recipe.id}`} className="inline-block py-1 font-mono text-sm text-muted hover:underline">
        ← Back to the recipe
      </Link>
      <h1 className="mt-5 font-mono text-[clamp(2.4rem,10vw,4rem)] font-extrabold leading-none tracking-[-0.05em]">
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
