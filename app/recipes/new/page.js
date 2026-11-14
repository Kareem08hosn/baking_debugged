import Link from "next/link";
import AddRecipeForm from "@/components/AddRecipeForm";

export const metadata = { title: "Add a recipe" };

// A fixed folder name ("new") wins over the [id] folder next to it,
// so /recipes/new shows this page instead of looking for a recipe called "new".
export default function NewRecipePage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <Link href="/" className="font-mono text-sm text-muted hover:underline">
        ← All recipes
      </Link>

      <h1 className="mt-4 font-mono text-3xl font-bold">Add a recipe</h1>
      <p className="mb-6 text-muted">
        Recipes you add are saved in this browser only, for now.
      </p>

      <AddRecipeForm />
    </main>
  );
}
