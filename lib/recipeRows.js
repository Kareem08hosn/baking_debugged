// Converting between database rows (snake_case) and the recipe objects the
// site uses (camelCase). Kept apart from lib/recipes.js so code running in
// the browser can use it too.

// The columns the recipe list needs. It leaves out the instructions, which
// are the biggest part of a recipe and only shown on the recipe's own page.
export const LIST_COLUMNS =
  "id, name, category, difficulty, prep_time, bake_time, servings, rating, diet, ingredients, tested";

// The same, plus who owns it: for people's own recipes. (The public list
// doesn't ask for owner, because the site's recipes never have one.)
export const MY_LIST_COLUMNS = `${LIST_COLUMNS}, owner`;

// Database row -> recipe object.
export function fromRow(row) {
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
    // null for the site's own recipes, a user id for someone's own recipe
    owner: row.owner ?? null,
  };
}

// Recipe object -> the columns to save. id and owner are left out on
// purpose: the database fills in both (owner = whoever is signed in).
export function toRow(recipe) {
  return {
    name: recipe.name,
    category: recipe.category,
    difficulty: recipe.difficulty,
    prep_time: recipe.prepTime,
    bake_time: recipe.bakeTime,
    servings: recipe.servings,
    pan: recipe.pan,
    rating: recipe.rating,
    diet: recipe.diet,
    ingredients: recipe.ingredients,
    instructions: recipe.instructions,
    tested: recipe.tested,
  };
}
