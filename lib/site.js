// Facts about the site that several components need: the pages in the
// navigation and the channel links. Kept in one file so a change here shows
// up in the header, the footer and the homepage at once.

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/recipes", label: "Recipes" },
  { href: "/chemistry", label: "Chemistry" },
  { href: "/tools", label: "Tools" },
  { href: "/debugger", label: "Debugger" },
  { href: "/about", label: "About" },
];

export const CHANNEL_HANDLE = "@Baking_Debugged";

// TODO: Kareem — check these three addresses. They were built from the
// handle above and have not been confirmed.
export const SOCIAL_LINKS = [
  { name: "Instagram", href: "https://www.instagram.com/baking_debugged/" },
  { name: "TikTok", href: "https://www.tiktok.com/@baking_debugged" },
  {
    name: "YouTube Shorts",
    href: "https://www.youtube.com/@Baking_Debugged/shorts",
  },
];

// The site's public address, for links that must be complete (sitemap,
// link previews). Set NEXT_PUBLIC_SITE_URL in the hosting settings when
// the site is deployed; until then it's the local dev server.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
