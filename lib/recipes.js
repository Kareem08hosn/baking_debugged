// Reading recipes from the database (the "recipes" table in Supabase).
// These functions run on the server only: pages call them while they are
// being built, and the browser receives the finished HTML.
//
// Shape of one recipe, as the rest of the site uses it:
//   id, name, category, difficulty, rating
//   bakeTime, prepTime  minutes, stored as numbers so we can sort and add them
//                       (prepTime is hands-on time only, not rising time)
//   servings            how many portions the amounts below make
//   pan                 id of the pan it is baked in (see lib/pans.js), or null
//                       for recipes with no pan (cookies, free-form loaves)
//   ingredients         { name, amount, unit } where unit is "g" (grams) or
//                       "count" (whole items like eggs)
//   instructions        a list of steps
//   diet                every diet the recipe fits (vegan food is also vegetarian)
//   source              { name, url } of the recipe this was adapted from, or null
//   tested              true once the site owner has baked it (false = "Untested")
//   rating              1 to 5. For an untested recipe (tested: false) it is the
//                       rating on the source site; null if there is none.
//
// The table itself is defined in supabase/schema.sql. data/recipes.json is
// what the table was first filled from, and what the Python scripts read.
import { cache } from "react";
import { supabase } from "@/lib/supabase/public";

// Database columns are snake_case (prep_time); JavaScript uses camelCase
// (prepTime). This converts one database row into the shape described above,
// so the rest of the site never sees the database's naming.
function fromRow(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    difficulty: row.difficulty,
    prepTime: row.prep_time,
    bakeTime: row.bake_time,
    servings: row.servings,
    pan: row.pan,
    rating: row.rating,
    diet: row.diet,
    ingredients: row.ingredients,
    instructions: row.instructions,
    source: row.source,
    tested: row.tested,
  };
}

// The columns the homepage needs. It leaves out the instructions, which are
// the biggest part of a recipe and are only shown on the recipe's own page.
// With over a hundred recipes that keeps the homepage much lighter.
const LIST_COLUMNS =
  "id, name, category, difficulty, prep_time, bake_time, servings, rating, diet, ingredients, tested";

// Returns every recipe, without instructions. "async" because asking the
// database takes time: "await" pauses here until the answer arrives.
export async function getRecipes() {
  // Reads like the SQL it becomes: SELECT id, name, ... FROM recipes ORDER BY id
  const { data, error } = await supabase
    .from("recipes")
    .select(LIST_COLUMNS)
    .order("id");

  // Supabase doesn't throw when a query fails; it hands back an error object.
  if (error) {
    throw new Error(`Could not load recipes: ${error.message}`);
  }
  return data.map(fromRow);
}

// Returns one recipe, or null if there is none with that id.
//
// cache() remembers the answer while one page is being built. The recipe page
// asks for the same recipe twice (once for the tab title, once for the page),
// and this makes that one database query instead of two.
export const getRecipeById = cache(async (id) => {
  // Values from a URL are always text ("3"), so Number() converts first.
  // Anything that isn't a whole number ("abc", "1.5") can't be a recipe id.
  const recipeId = Number(id);
  if (!Number.isInteger(recipeId)) {
    return null;
  }

  // SELECT * FROM recipes WHERE id = recipeId
  // maybeSingle() means "expect one row or none" and gives null for none.
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", recipeId)
    .maybeSingle();

  if (error) {
    throw new Error(`Could not load recipe ${recipeId}: ${error.message}`);
  }
  return data === null ? null : fromRow(data);
});
