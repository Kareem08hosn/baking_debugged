import Link from "next/link";
import LogoMark from "@/components/LogoMark";
import SiteNav from "@/components/SiteNav";

// The top of every page: logo on the left, navigation on the right.
// It is used once, in app/layout.js, which wraps every page.
export default function SiteHeader() {
  return (
    <header>
      {/* flex-wrap lets the phone menu drop onto its own line when open */}
      <div className="page flex flex-wrap items-center justify-between gap-x-6 gap-y-2 pb-1.5 pt-3.5">
        <Link href="/" className="flex items-center gap-3">
          {/* A round badge in the ink colour with the mark in the paper
              colour, so it flips with the theme. */}
          <LogoMark className="size-10.5 rounded-full bg-foreground text-background" />
          <span className="font-mono text-lg font-bold">Baking Debugged</span>
        </Link>

        <SiteNav />
      </div>
    </header>
  );
}
