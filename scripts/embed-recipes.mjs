// Builds the embeddings for "find a recipe by describing it".
// Run with:  npm run embed
// Needs in .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY,
// GEMINI_API_KEY, and supabase/add-ai.sql run in Supabase first.
//
// It embeds every site recipe (owner is null) and stores the vectors in
// recipe_embeddings. Recipes whose text hasn't changed are skipped, so
// running it again after adding recipes is cheap.
import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { EMBED_MODEL } from "../lib/ai/config.js";
import { documentText, embedTexts } from "../lib/ai/gemini.js";

const BATCH = 50; // texts per API call

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
if (!url || !secret || !process.env.GEMINI_API_KEY) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY and GEMINI_API_KEY in .env.local first.");
  process.exit(1);
}
// The secret key is needed to write recipe_embeddings (nobody else can).
const db = createClient(url, secret, { auth: { persistSession: false } });

// The text that represents a recipe in the search: what a person might
// describe. The first steps hint at technique (kneading, creaming...).
function recipeText(recipe) {
  const ingredients = recipe.ingredients.map((item) => item.name).join(", ");
  const steps = recipe.instructions.slice(0, 3).join(" ");
  const text = `${recipe.category}, ${recipe.difficulty}. Diet: ${recipe.diet.join(", ") || "none"}. Ingredients: ${ingredients}. Method: ${steps}`;
  return documentText(recipe.name, text);
}

const { data: recipes, error } = await db
  .from("recipes")
  .select("id, name, category, difficulty, diet, ingredients, instructions")
  .is("owner", null)
  .order("id");
if (error) {
  console.error("Could not read recipes:", error.message);
  process.exit(1);
}

const { data: existing } = await db.from("recipe_embeddings").select("recipe_id, content_hash, model");
const known = new Map((existing ?? []).map((row) => [row.recipe_id, row]));

// Only recipes that are new or changed (or embedded with another model)
const todo = recipes
  .map((recipe) => {
    const text = recipeText(recipe);
    const hash = createHash("sha256").update(text).digest("hex");
    return { recipe, text, hash };
  })
  .filter(({ recipe, hash }) => {
    const row = known.get(recipe.id);
    return !row || row.content_hash !== hash || row.model !== EMBED_MODEL;
  });

console.log(`${recipes.length} recipes, ${todo.length} to embed with ${EMBED_MODEL}.`);

for (let start = 0; start < todo.length; start += BATCH) {
  const batch = todo.slice(start, start + BATCH);
  const vectors = await embedTexts(batch.map((item) => item.text));
  const rows = batch.map((item, index) => ({
    recipe_id: item.recipe.id,
    // pgvector reads a vector written as "[0.1,0.2,...]"
    embedding: JSON.stringify(vectors[index]),
    content_hash: item.hash,
    model: EMBED_MODEL,
    updated_at: new Date().toISOString(),
  }));
  const { error: saveError } = await db.from("recipe_embeddings").upsert(rows);
  if (saveError) {
    console.error("Saving embeddings failed:", saveError.message);
    process.exit(1);
  }
  console.log(`Embedded ${Math.min(start + BATCH, todo.length)} / ${todo.length}`);
}
console.log("Done.");
