// Next.js shows this page when something goes wrong while building a page,
// for example when the database can't be reached. Error pages must be client
// components.
"use client";

import Link from "next/link";

// "retry" is a function Next.js passes in: calling it tries the page again.
export default function ErrorPage({ retry }) {
  return (
    <main className="page pb-10 pt-10">
      <div className="graph sheet mx-auto max-w-2xl px-6 pb-9 pt-11 md:px-12">
        <p className="stamp-label mb-5">Unexpected result</p>
        <h1 className="page-title">
          <span className="highlight">This page didn’t load</span>
        </h1>
        <p className="mt-5 max-w-md text-lg">
          Something went wrong on our side, usually a short problem reaching
          the recipe database. Try again in a moment.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <button type="button" onClick={() => retry()} className="btn">
            Try again
          </button>
          <Link href="/" className="btn-paper">
            Go to the homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
