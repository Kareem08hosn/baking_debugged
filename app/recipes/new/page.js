import Link from "next/link";
import AddRecipeForm from "@/components/AddRecipeForm";

export const metadata = { title: "Add a recipe" };

// A fixed folder name ("new") wins over the [id] folder next to it,
// so /recipes/new shows this page instead of looking for a recipe called "new".
export default function NewRecipePage() {
  return (
    <main className="page max-w-3xl pt-5">
      <Link href="/recipes" className="inline-block py-1 font-mono text-sm text-muted hover:underline">
        ← All recipes
      </Link>

      <h1 className="mt-5 font-mono text-[clamp(2.4rem,10vw,4rem)] font-extrabold leading-none tracking-[-0.05em]">
        <span className="highlight">Add a recipe</span>
      </h1>
      <p className="mb-10 mt-4 max-w-xl text-lg">
        Write it up like an experiment: what goes in, how much, and what to
        do. It appears in the recipe list with scaling and unit conversion.
      </p>

      <AddRecipeForm />
    </main>
  );
}
