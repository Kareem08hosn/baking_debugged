"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Recipes" },
  { href: "/recipes/new", label: "Add" },
];

// The header's page links. This is a client component only because it needs
// usePathname: the address of the page being shown, so the current page's
// link can be highlighted.
export default function NavLinks() {
  const pathname = usePathname();

  return links.map((link) => (
    <Link
      key={link.href}
      href={link.href}
      // aria-current tells screen readers which link is the current page
      aria-current={pathname === link.href ? "page" : undefined}
      className={pathname === link.href ? "highlight" : "hover:underline"}
    >
      {link.label}
    </Link>
  ));
}
