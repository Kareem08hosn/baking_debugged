import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

// The bottom of every page: the site name, links and the theme switch.
export default function SiteFooter() {
  return (
    // mt-auto pushes the footer to the bottom of the window on short pages
    // (the <body> in layout.js is a full-height column)
    <footer className="mt-auto pt-12">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t-[1.5px] border-dashed border-foreground px-4 py-4 font-mono text-xs text-muted">
        <span>Baking Debugged · measured in grams</span>
        <span className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link href="/" className="hover:underline">
            Recipes
          </Link>
          <Link href="/recipes/new" className="hover:underline">
            Add a recipe
          </Link>
          <ThemeToggle />
        </span>
      </div>
    </footer>
  );
}
