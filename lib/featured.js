// Chooses which recipes the homepage shows. Plain functions with no React
// and no database, so they can be tested (see lib/featured.test.js).
import { showsHydration } from "./scaler.js";

// One week in milliseconds (7 days x 24 h x 60 min x 60 s x 1000 ms).
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
// How far down the list the pick jumps each week. A big jump, so two weeks
// in a row aren't both cookies (the list is grouped by category).
const WEEKLY_JUMP = 37;

// Returns { lead, others }: this week's recipe, then a few more, each from a
// different category so the row isn't three kinds of cookie.
// Nothing here claims a recipe is "the best": none has been rated yet, so
// the pick simply moves down the list every week and every recipe gets a turn.
// "now" is the time in milliseconds; tests pass their own.
export function pickFeatured(recipes, count = 3, now = Date.now()) {
  // Whole weeks since 1970. It goes up by one every seven days.
  const week = Math.floor(now / WEEK_MS);

  // The recipes in the order they get their turn, starting with this week's.
  // % (remainder) wraps a position past the end back to the start.
  const inTurn = recipes.map(
    (_, step) => recipes[((week + step) * WEEKLY_JUMP) % recipes.length]
  );

  // ?? null: an empty list has no first item (undefined), so use null.
  const lead = inTurn[0] ?? null;
  const others = [];
  // A Set remembers which categories have been used already.
  const usedCategories = new Set(lead ? [lead.category] : []);

  // slice(1) is the list without its first item (the lead).
  for (const recipe of inTurn.slice(1)) {
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
