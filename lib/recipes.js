// The built-in recipes. They live in data/recipes.json so the website (this
// file) and the Python scripts in python/ read the same data. Later (Phase 3)
// they move into a database.
//
// PLACEHOLDER recipes: the amounts and steps are stand-ins until the real
// recipes replace them.
//
// Shape of one recipe:
//   bakeTime, prepTime  minutes, stored as numbers so we can sort and add them
//                       (prepTime is hands-on time only, not rising time)
//   servings            how many portions the amounts below make
//   pan                 id of the pan it is baked in (see lib/pans.js), or null
//                       for recipes with no pan (cookies, free-form loaves)
//   ingredients         { name, amount, unit } where unit is "g" (grams) or
//                       "count" (whole items like eggs). Grams everywhere else
//                       so scaling and baker's percentages are simple maths.
//   diet                every diet the recipe fits (vegan food is also vegetarian)
//
// JSON is plain data with no comments, which is why the notes are here.
// "export" makes the array importable from other files (like "public" in Java).
import recipes from "@/data/recipes.json";

export { recipes };

// Finds one recipe by its id, or returns undefined if there isn't one.
// Values from a URL are always text ("3"), so Number() converts first.
export function getRecipeById(id) {
  return recipes.find((recipe) => recipe.id === Number(id));
}
