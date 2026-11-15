import Link from "next/link";
import { notFound } from "next/navigation";
import SignInCard from "@/components/SignInCard";
import BakeForm from "@/components/bakes/BakeForm";
import { getMyBake, getRecipeChoices } from "@/lib/journal";
import { getUser } from "@/lib/supabase/server";

export const metadata = { title: "Edit bake" };

export default async function EditBakePage({ params }) {
  const { id } = await params;
  const user = await getUser();
  if (!user) {
    return (
      <main className="page max-w-3xl pt-6">
        <SignInCard title="Sign in to see your bakes" text="Your bake log belongs to your account." />
      </main>
    );
  }

  const bake = await getMyBake(id);
  if (!bake) {
    notFound();
  }
  const recipes = await getRecipeChoices();

  return (
    <main className="page max-w-3xl pt-5">
      <Link href="/bakes" className="back-link">
        ← Bake log
      </Link>
      <h1 className="mt-5 page-title">
        <span className="highlight">{bake.title}</span>
      </h1>
      <div className="mb-10 mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="font-mono text-muted">{bake.bakedOn}</p>
        <Link href={`/debugger?bake=${bake.id}`} className="btn-quiet">
          Debug this bake
        </Link>
      </div>
      <BakeForm key={bake.id} bake={bake} recipes={recipes} />
    </main>
  );
}
