// Next.js shows this page when something goes wrong while building a page,
// for example when the database can't be reached. Error pages must be client
// components.
"use client";

// "retry" is a function Next.js passes in: calling it tries the page again.
export default function ErrorPage({ retry }) {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 pt-8">
      <h1 className="font-mono text-[2rem] font-bold leading-tight">
        <span className="highlight">Something went wrong</span>
      </h1>
      <p className="mt-2 text-muted">
        The page couldn’t be loaded. This is usually temporary.
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="btn mt-4"
      >
        Try again
      </button>
    </main>
  );
}
