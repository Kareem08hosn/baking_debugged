import Image from "next/image";
import Link from "next/link";
import AccountLink from "@/components/AccountLink";
import NavLinks from "@/components/NavLinks";

// The top of every page: logo on the left, navigation on the right.
// It is used once, in app/layout.js, which wraps every page.
export default function SiteHeader() {
  return (
    <header>
      {/* flex-wrap lets the navigation drop to a second line on narrow phones */}
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 pb-2 pt-4">
        <Link href="/" className="flex items-center gap-3">
          {/* Image is Next.js's <img>. width/height reserve the space so the
              page doesn't jump when the logo loads. alt is empty because the
              name is written right next to it. */}
          <Image
            src="/brand/logo-mark-round.svg"
            alt=""
            width={40}
            height={40}
            className="rounded-full ring-1 ring-line"
          />
          <span className="font-mono text-lg font-bold">Baking Debugged</span>
        </Link>

        <nav className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-sm">
          <NavLinks />
          <AccountLink />
        </nav>
      </div>
    </header>
  );
}
