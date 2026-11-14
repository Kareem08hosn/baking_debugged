import Link from "next/link";
import LogoMark from "@/components/LogoMark";
import ThemeToggle from "@/components/ThemeToggle";
import { NAV_LINKS, SOCIAL_LINKS } from "@/lib/site";

// The bottom of every page: logo, page links, channel links, theme switch.
export default function SiteFooter() {
  return (
    // mt-auto pushes the footer to the bottom of the window on short pages
    // (the <body> in layout.js is a full-height column)
    <footer className="mt-auto pt-14">
      <div className="page">
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-t-[1.5px] border-dashed border-foreground pb-8 pt-5 font-mono text-[0.8125rem]">
          <Link href="/" className="flex items-center gap-2.5 text-base font-bold">
            <LogoMark className="size-8.5 rounded-full bg-foreground text-background" />
            Baking Debugged
          </Link>

          <nav aria-label="Footer" className="flex flex-wrap gap-x-4 gap-y-1">
            {/* slice(1) skips "Home": the logo already goes there */}
            {NAV_LINKS.slice(1).map((link) => (
              <Link key={link.href} href={link.href} className="py-1 underline underline-offset-4">
                {link.label}
              </Link>
            ))}
            <Link href="/privacy" className="py-1 underline underline-offset-4">
              Privacy
            </Link>
          </nav>

          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {SOCIAL_LINKS.map((link) => (
              // A plain <a> for other websites; Link is for our own pages.
              <a key={link.name} href={link.href} className="py-1 underline underline-offset-4">
                {link.name}
              </a>
            ))}
          </div>

          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}
