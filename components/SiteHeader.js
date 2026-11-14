import Image from "next/image";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

// The bar at the top of every page: logo on the left, navigation and the
// theme toggle on the right. It is used once, in app/layout.js, which wraps
// every page.
//
// Its colours are the page's colours swapped (bg-foreground + text-background):
// a green bar on the cream theme, a cream bar on the green theme.
export default function SiteHeader() {
  return (
    <header className="bg-foreground text-background">
      {/* flex-wrap lets the navigation drop to a second line on narrow phones */}
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          {/* Image is Next.js's <img>. width/height reserve the space so the
              page doesn't jump when the logo loads. alt is empty because the
              name is written right next to it. */}
          <Image
            src="/brand/logo-mark-round.svg"
            alt=""
            width={40}
            height={40}
            className="rounded-full ring-1 ring-background/40"
          />
          <span className="font-mono text-lg font-bold">Baking Debugged</span>
        </Link>

        {/* items-center lines the links up with the dropdown */}
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-sm">
          <Link href="/" className="hover:underline">
            Recipes
          </Link>
          <Link href="/recipes/new" className="hover:underline">
            Add a recipe
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
