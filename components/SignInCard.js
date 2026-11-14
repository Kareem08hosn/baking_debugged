"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// The card shown on account-only pages to visitors who aren't signed in.
//   title  "Sign in to keep a bake log"
//   text   one sentence on why
// The Sign in link remembers this page, so signing in comes back here.
// (A client component only because it needs usePathname.)
export default function SignInCard({ title, text }) {
  const pathname = usePathname();
  return (
    <div className="note note-ruled tape mt-10 max-w-md -rotate-1 px-5 pb-6 pt-8">
      <p className="font-mono text-lg font-bold leading-7">{title}</p>
      <p className="leading-7">{text}</p>
      <Link href={`/login?next=${encodeURIComponent(pathname)}`} className="btn mt-4">
        Sign in
      </Link>
    </div>
  );
}
