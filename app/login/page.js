import Link from "next/link";
import { getUser } from "@/lib/supabase/server";
import LoginForm from "./LoginForm";

export const metadata = { title: "Sign in" };

// searchParams is the part of the URL after "?", e.g. /login?error=link.
// Like params, it arrives as a Promise.
export default async function LoginPage({ searchParams }) {
  const { error } = await searchParams;
  const user = await getUser();

  return (
    <main className="mx-auto w-full max-w-md px-4 py-8">
      <h1 className="font-mono text-3xl font-bold">Sign in</h1>

      {user ? (
        <p className="mt-4">
          You are signed in as {user.email}.{" "}
          <Link href="/" className="underline">
            Back to the recipes
          </Link>
        </p>
      ) : (
        <>
          <p className="mb-6 mt-2 text-muted">
            No password needed. Enter your email and we’ll send you a link
            that signs you in. New here? The same link creates your account.
          </p>

          {/* Shown when a sign-in link didn't work (see app/auth/confirm) */}
          {error === "link" && (
            <p role="alert" className="mb-4 rounded border border-foreground p-2 font-semibold">
              That sign-in link has expired or was already used. Request a new
              one below.
            </p>
          )}

          <LoginForm />
        </>
      )}
    </main>
  );
}
