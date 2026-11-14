import { TOPICS } from "@/lib/chemistry/topics";
import { getRecipes } from "@/lib/recipes";
import { SITE_URL } from "@/lib/site";

// Rebuilt at most once an hour, so new recipes appear in it.
export const revalidate = 3600;

// /sitemap.xml: every public page, so search engines can find them all.
export default async function sitemap() {
  const pages = ["", "/recipes", "/chemistry", "/tools", "/debugger", "/pantry", "/find", "/substitutions", "/about", "/privacy"];
  const recipes = await getRecipes();
  return [
    ...pages.map((path) => ({ url: `${SITE_URL}${path}` })),
    ...TOPICS.map((topic) => ({ url: `${SITE_URL}/chemistry/${topic.slug}` })),
    ...recipes.map((recipe) => ({ url: `${SITE_URL}/recipes/${recipe.id}` })),
  ];
}
