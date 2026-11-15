import Link from "next/link";
import { getUser } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/safeNext";
import LoginForm from "./LoginForm";

export const metadata = { title: "Sign in" };

// searchParams is the part of the URL after "?", e.g. /login?error=link.
// Like params, it arrives as a Promise.
export default async function LoginPage({ searchParams }) {
  const { error, next: rawNext } = await searchParams;
  const next = safeNextPath(rawNext);
  const user = await getUser();

  return (
    // One column on phones; from "md" up the explanation sits beside the form.
    <main className="page grid gap-10 pt-8 md:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] md:items-start md:gap-14 md:pt-12">
      <div>
        <h1 className="page-title">
          <span className="highlight">Sign in</span>
        </h1>
        <p className="mt-5 max-w-md text-lg">
          No password needed. Enter your email and you’ll get a link that
          signs you in. New here? The same link creates your account.
        </p>
        <p className="hand mt-5 max-w-sm -rotate-1 text-muted">
          your saved recipes, notes and bake log, on any device
        </p>
      </div>

      <div>
        {user ? (
          <div className="note tape px-5 pb-5 pt-8">
            <p className="font-mono text-lg font-bold">You’re signed in</p>
            <p className="mt-1.5 break-words text-muted">as {user.email}</p>
            <Link href={next === "/" ? "/recipes" : next} className="btn mt-5">
              {next === "/" ? "Browse the recipes" : "Carry on"}
            </Link>
          </div>
        ) : (
          <>
            {/* Shown when a sign-in link didn't work (see app/auth/confirm) */}
            {error === "link" && (
              <p role="alert" className="alert mb-6">
                That sign-in link has expired or was already used. Request a
                new one below.
              </p>
            )}
            <LoginForm next={next} />
          </>
        )}
      </div>
    </main>
  );
}
