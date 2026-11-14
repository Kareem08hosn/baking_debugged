"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AccountLink from "@/components/AccountLink";
import { NAV_LINKS } from "@/lib/site";

// True if this link is the page being shown. "/recipes" also counts as
// current on "/recipes/3", but "/" only matches the homepage itself
// (every address starts with "/").
function isCurrent(pathname, href) {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

// The header's navigation. On wide screens the links sit in a row. On
// phones they are hidden behind a menu button (the "hamburger").
//
// It is a client component for two reasons: usePathname (which page is
// showing) and useState (is the phone menu open).
export default function SiteNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  // A ref points at a real element on the page: here the menu button, so
  // focus can be moved back to it.
  const buttonRef = useRef(null);

  // Pressing Escape closes the menu, as people expect from anything that
  // opens, and puts keyboard focus back on the button that opened it.
  function handleKeyDown(event) {
    if (event.key === "Escape" && isOpen) {
      setIsOpen(false);
      buttonRef.current.focus();
    }
  }

  return (
    <>
      {/* The menu button: phones only (md:hidden hides it from the "md"
          width up). aria-expanded tells screen readers whether the menu is
          open; aria-controls says which element it opens. */}
      <button
        ref={buttonRef}
        type="button"
        className="grid size-11 place-content-center rounded-full border-[1.5px] border-foreground md:hidden"
        aria-expanded={isOpen}
        aria-controls="site-nav"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
      >
        <span className="sr-only">Menu</span>
        <svg
          viewBox="0 0 24 24"
          className="size-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          {/* Three lines when closed, a cross when open */}
          {isOpen ? (
            <path d="M5 5 L19 19 M19 5 L5 19" />
          ) : (
            <path d="M3 6 H21 M3 12 H21 M3 18 H21" />
          )}
        </svg>
      </button>

      {/* On phones this is a paper panel under the header, shown only while
          open. From "md" up it is always a plain row (the md: classes undo
          the panel styling).

          The onClick is on the <nav>, not on each link: a click on anything
          inside "bubbles" up to its parents, so one handler here closes the
          menu whichever link was pressed. */}
      <nav
        id="site-nav"
        aria-label="Main"
        onClick={() => setIsOpen(false)}
        onKeyDown={handleKeyDown}
        className={`${
          isOpen ? "flex" : "hidden"
        } note basis-full flex-col items-start px-4 pb-3 pt-1.5 font-mono text-[1.05rem] md:flex md:basis-auto md:flex-row md:items-center md:gap-x-5 md:bg-transparent md:p-0 md:text-sm md:shadow-none`}
      >
        {NAV_LINKS.map((link) => {
          const current = isCurrent(pathname, link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              // aria-current tells screen readers which link is this page
              aria-current={current ? "page" : undefined}
              className="py-2.5 md:py-1"
            >
              {/* The highlighter goes on a span so it hugs the word, not
                  the link's whole tap area. */}
              <span className={current ? "highlight" : "hover:underline"}>
                {link.label}
              </span>
            </Link>
          );
        })}
        <span className="py-2.5 md:py-1">
          <AccountLink />
        </span>
      </nav>
    </>
  );
}
