// Next.js shows this page when something goes wrong while building a page,
// for example when the database can't be reached. Error pages must be client
// components.
"use client";

// "retry" is a function Next.js passes in: calling it tries the page again.
export default function ErrorPage({ retry }) {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="font-mono text-3xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-muted">
        The page couldn’t be loaded. This is usually temporary.
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-4 rounded bg-foreground px-4 py-2 font-mono font-bold text-background hover:opacity-90"
      >
        Try again
      </button>
    </main>
  );
}
