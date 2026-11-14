// Writes supabase/seed.sql from data/recipes.json.
// Run with:  npm run seed:sql   (after editing data/recipes.json)
// Then paste supabase/seed.sql into the Supabase SQL Editor and run it.
//
// The SQL it writes is safe to run again and again: it adds or updates the
// SITE recipes (owner is null) and never touches recipes people saved.
import { readFileSync, writeFileSync } from "node:fs";

const recipes = JSON.parse(readFileSync("data/recipes.json", "utf8"));

// SQL text goes in single quotes; a quote inside it is written twice ('').
function text(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

// A list of text values: array['a', 'b']::text[]
function textArray(values) {
  return `array[${values.map(text).join(", ")}]::text[]`;
}

// Any JavaScript value stored as JSON: '{"a": 1}'::jsonb (or null)
function json(value) {
  return value == null ? "null" : `${text(JSON.stringify(value))}::jsonb`;
}

// One recipe as one row of values, in the same order as COLUMNS below.
function row(recipe) {
  const values = [
    recipe.id,
    text(recipe.name),
    text(recipe.category),
    text(recipe.difficulty),
    recipe.prepTime,
    recipe.bakeTime,
    recipe.servings,
    recipe.pan == null ? "null" : text(recipe.pan),
    recipe.rating ?? "null",
    textArray(recipe.diet),
    json(recipe.ingredients),
    textArray(recipe.instructions),
    json(recipe.source),
    recipe.tested,
    "null", // owner: these are the site's recipes
  ];
  return `  (${values.join(", ")})`;
}

const COLUMNS = [
  "id", "name", "category", "difficulty", "prep_time", "bake_time", "servings",
  "pan", "rating", "diet", "ingredients", "instructions", "source", "tested",
  "owner",
];
// Every column except id and owner is overwritten when the recipe exists.
const updates = COLUMNS.filter((column) => column !== "id" && column !== "owner")
  .map((column) => `  ${column} = excluded.${column}`)
  .join(",\n");
const ids = recipes.map((recipe) => recipe.id).join(", ");

const sql = `-- Baking Debugged: the site's starter recipes (${recipes.length} of them).
-- WRITTEN BY scripts/build-seed.mjs from data/recipes.json. Don't edit by
-- hand: edit the JSON and run "npm run seed:sql".
--
-- Run in the Supabase SQL Editor (after schema.sql on a new database).
-- Safe to run again: it only adds, updates or removes SITE recipes
-- (owner is null). Recipes that people saved themselves are never touched.
--
-- Each recipe was adapted (amounts converted to grams, instructions
-- rewritten) from the page in "source". None has been test-baked yet, so
-- tested is false and rating is null. After baking one, set tested to true
-- and rating to your own score.

-- 1. Add each recipe, or update it if a site recipe with that id exists.
--    "as saved" names the row already in the table, so the last line can
--    check it: a recipe that belongs to a person is left alone.
insert into public.recipes as saved
  (${COLUMNS.join(", ")})
values
${recipes.map(row).join(",\n")}
on conflict (id) do update set
${updates}
where saved.owner is null;

-- 2. Remove site recipes that are no longer in data/recipes.json.
delete from public.recipes
where owner is null
  and id not in (${ids});

-- 3. The rows above gave explicit ids, so move the id counter past the
--    highest one. The next recipe someone adds then gets a free id.
select setval(
  pg_get_serial_sequence('public.recipes', 'id'),
  (select max(id) from public.recipes)
);
`;

writeFileSync("supabase/seed.sql", sql);
console.log(`Wrote supabase/seed.sql with ${recipes.length} recipes.`);
