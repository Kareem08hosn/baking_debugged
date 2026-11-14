// Chooses which recipes the homepage shows. Plain functions with no React
// and no database, so they can be tested (see lib/featured.test.js).
import { showsHydration } from "./scaler.js";

// Returns { lead, others }: the top-rated recipe, then the next best ones,
// each from a different category so the row isn't three kinds of cookie.
export function pickFeatured(recipes, count = 3) {
  // Highest rating first. Recipes with no rating count as 0.
  const byRating = recipes.toSorted(
    (a, b) => (b.rating ?? 0) - (a.rating ?? 0)
  );

  // ?? null: an empty list has no first item (undefined), so use null.
  const lead = byRating[0] ?? null;
  const others = [];
  // A Set remembers which categories have been used already.
  const usedCategories = new Set(lead ? [lead.category] : []);

  // slice(1) is the list without its first item (the lead).
  for (const recipe of byRating.slice(1)) {
    if (others.length === count) {
      break; // stop the loop: we have enough
    }
    if (!usedCategories.has(recipe.category)) {
      others.push(recipe);
      usedCategories.add(recipe.category);
    }
  }

  return { lead, others };
}

// The recipe used in the homepage's scaling demo: a bread (so it has a
// hydration figure) with the shortest ingredient list (so the demo is small).
// Falls back to any recipe, and to null if there are none at all.
export function pickDemoRecipe(recipes) {
  const breads = recipes.filter(showsHydration);
  const candidates = breads.length > 0 ? breads : recipes;
  const shortestFirst = candidates.toSorted(
    (a, b) => a.ingredients.length - b.ingredients.length
  );
  return shortestFirst[0] ?? null;
}
