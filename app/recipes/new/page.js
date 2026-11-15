import Link from "next/link";
import AddRecipeForm from "@/components/AddRecipeForm";
import SignInCard from "@/components/SignInCard";
import { getUser } from "@/lib/supabase/server";

export const metadata = { title: "Add a recipe" };

// A fixed folder name ("new") wins over the [id] folder next to it,
// so /recipes/new shows this page instead of looking for a recipe called "new".
// It asks who is signed in, so it is built for each request.
export default async function NewRecipePage() {
  const user = await getUser();

  return (
    <main className="page max-w-3xl pt-5">
      <Link href="/recipes" className="back-link">
        ← All recipes
      </Link>

      <h1 className="mt-5 page-title">
        <span className="highlight">Add a recipe</span>
      </h1>

      {user ? (
        <>
          <p className="mb-10 mt-4 max-w-xl text-lg">
            Write it up like an experiment: what goes in, how much, and what
            to do. It’s saved to your account and only you can see it, with
            scaling and unit conversion like every other recipe.
          </p>
          <AddRecipeForm />
        </>
      ) : (
        // Signed out: recipes belong to an account, so ask to sign in first.
        <SignInCard
          title="Sign in to add recipes"
          text="Your recipes are saved to your account, so you can find them on any device. Signing in takes one email, no password."
        />
      )}
    </main>
  );
}
