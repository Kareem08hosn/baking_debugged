import { SITE_URL } from "@/lib/site";

// /robots.txt: tells search engines what to crawl. Private, signed-in pages
// are left out; they'd only show a sign-in card to a crawler anyway.
export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/account", "/bakes", "/recipes/new", "/login", "/auth/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
