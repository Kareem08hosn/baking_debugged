import Link from "next/link";
import SignInCard from "@/components/SignInCard";
import ImportBakes from "@/components/bakes/ImportBakes";
import { getUser } from "@/lib/supabase/server";

export const metadata = { title: "Import bakes" };

export default async function ImportBakesPage() {
  const user = await getUser();

  return (
    <main className="page max-w-4xl pt-5">
      <Link href="/bakes" className="inline-block py-1 font-mono text-sm text-muted hover:underline">
        ← Bake log
      </Link>
      <h1 className="mt-5 font-mono text-[clamp(2.4rem,10vw,4rem)] font-extrabold leading-none tracking-[-0.05em]">
        <span className="highlight">Import bakes</span>
      </h1>
      {user ? (
        <>
          <p className="mb-10 mt-4 max-w-xl text-lg">
            Bring in the bake log you already keep. Column names are matched
            loosely: “hydration_%”, “Hydration” and “hydration (%)” all work.
          </p>
          <ImportBakes />
        </>
      ) : (
        <SignInCard title="Sign in to import bakes" text="Imported bakes go into your own bake log." />
      )}
    </main>
  );
}
