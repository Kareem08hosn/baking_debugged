// Reading recipes from the database (the "recipes" table in Supabase).
// These functions run on the server only: pages call them while they are
// being built, and the browser receives the finished HTML.
//
// Shape of one recipe, as the rest of the site uses it:
//   id, name, category, difficulty, rating
//   bakeTime, prepTime  minutes, stored as numbers so we can sort and add them
//                       (prepTime is hands-on time only, not rising time)
//   servings            how many portions (or cookies, muffins...) the amounts
//                       below make; see lib/servings.js
//   pan                 id of the pan it is baked in (see lib/pans.js), or null
//                       for recipes with no pan (cookies, free-form loaves)
//   ingredients         { name, amount, unit } where unit is "g" (grams) or
//                       "count" (whole items like eggs)
//   instructions        a list of steps
//   diet                every diet the recipe fits (vegan food is also vegetarian)
//   source              { name, url } of the recipe this was adapted from, or null
//   tested              true once the site owner has baked it (false = "Untested")
//   rating              1 to 5, given by whoever baked it; null for a recipe
//                       nobody has test-baked yet (never another site's stars)
//
// These use the anonymous client, so they only ever see the site's own
// recipes (owner is null). People's own recipes are private and are fetched
// in the browser instead (see lib/myRecipes.js).
//
// The table itself is defined in supabase/schema.sql. data/recipes.json is
// what the table was first filled from, and what the Python scripts read.
import { cache } from "react";
import { LIST_COLUMNS, fromRow } from "@/lib/recipeRows";
import { supabase } from "@/lib/supabase/public";
// "as" renames an import, so it isn't confused with other createClients
import { createClient as createServerClient, getUser } from "@/lib/supabase/server";

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

// Returns one of the signed-in person's OWN recipes (for editing), or null
// if nobody is signed in, there is no such recipe, or it isn't theirs.
// Unlike the functions above, this uses the signed-in client, so the page
// that calls it is built for each request.
export async function getOwnRecipe(id) {
  const recipeId = Number(id);
  const user = await getUser();
  if (!user || !Number.isInteger(recipeId)) {
    return null;
  }
  const client = await createServerClient();
  const { data, error } = await client
    .from("recipes")
    .select("*")
    .eq("id", recipeId)
    .eq("owner", user.id)
    .maybeSingle();
  if (error) {
    throw new Error(`Could not load recipe ${recipeId}: ${error.message}`);
  }
  return data === null ? null : fromRow(data);
}
