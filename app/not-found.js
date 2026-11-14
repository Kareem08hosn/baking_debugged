import Link from "next/link";

export const metadata = { title: "Page not found" };

// Next.js shows this page for any address that doesn't match a page
// (a "404"). The file name not-found.js is what makes it special.
export default function NotFound() {
  return (
    <main className="page pb-10 pt-10">
      <div className="graph sheet mx-auto max-w-2xl px-6 pb-9 pt-11 md:px-12">
        <p className="stamp-label mb-5">Error 404</p>
        <h1 className="font-mono text-[clamp(2.4rem,10vw,4rem)] font-extrabold leading-none tracking-[-0.05em]">
          <span className="highlight">Experiment failed</span>
        </h1>
        <p className="mt-5 max-w-md text-lg">
          There’s no page at this address. The link may be old, or the
          address may have a typo.
        </p>
        <p className="hand mt-4 -rotate-1 text-muted">
          result: nothing rose. try another one.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/recipes" className="btn">
            Browse the recipes
          </Link>
          <Link href="/" className="btn-paper">
            Go to the homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
