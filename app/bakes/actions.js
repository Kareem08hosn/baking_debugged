// Server actions for the bake log (see app/recipes/actions.js for the idea).
// Every one checks who is signed in and re-checks the data with
// validateBake, because anything from a browser can be faked.
"use server";

import { toBakeRow, validateBake } from "@/lib/bakes";
import { createClient, getUser } from "@/lib/supabase/server";

// The most rows one import may add.
const MAX_IMPORT = 2000;

// Logs a new bake. Returns { id } or { error }.
export async function createBake(input) {
  const user = await getUser();
  if (!user) {
    return { error: "Sign in to log bakes." };
  }
  const { bake, error } = validateBake(input);
  if (error) {
    return { error };
  }
  const supabase = await createClient();
  const { data, error: dbError } = await supabase
    .from("bakes")
    .insert(toBakeRow(bake))
    .select("id")
    .single();
  if (dbError) {
    console.error("Logging a bake failed:", dbError.message);
    return { error: "The bake couldn’t be saved. Try again in a moment." };
  }
  return { id: data.id };
}

// Saves changes to one of the person's bakes. Returns { id } or { error }.
export async function updateBake(id, input) {
  const user = await getUser();
  if (!user) {
    return { error: "Sign in to change bakes." };
  }
  if (!Number.isInteger(id)) {
    return { error: "That bake doesn’t exist." };
  }
  const { bake, error } = validateBake(input);
  if (error) {
    return { error };
  }
  const supabase = await createClient();
  const { data, error: dbError } = await supabase
    .from("bakes")
    .update(toBakeRow(bake))
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id");
  if (dbError) {
    console.error("Updating a bake failed:", dbError.message);
    return { error: "The changes couldn’t be saved. Try again in a moment." };
  }
  if (data.length === 0) {
    return { error: "That bake doesn’t exist, or isn’t yours." };
  }
  return { id };
}

// Deletes one of the person's bakes. Returns {} or { error }.
export async function deleteBake(id) {
  const user = await getUser();
  if (!user) {
    return { error: "Sign in to delete bakes." };
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bakes")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id");
  if (error) {
    console.error("Deleting a bake failed:", error.message);
    return { error: "The bake couldn’t be deleted. Try again in a moment." };
  }
  if (data.length === 0) {
    return { error: "That bake doesn’t exist, or isn’t yours." };
  }
  return {};
}

// Adds many bakes at once (from an imported spreadsheet). Every row is
// checked first; if any is bad, nothing is added, so a half-finished import
// can't happen. Returns { count } or { error }.
export async function importBakes(inputs) {
  const user = await getUser();
  if (!user) {
    return { error: "Sign in to import bakes." };
  }
  if (!Array.isArray(inputs) || inputs.length === 0) {
    return { error: "There’s nothing to import." };
  }
  if (inputs.length > MAX_IMPORT) {
    return { error: `One import can add up to ${MAX_IMPORT} bakes. Split the file.` };
  }
  const rows = [];
  for (const [index, input] of inputs.entries()) {
    const { bake, error } = validateBake(input);
    if (error) {
      return { error: `Row ${index + 1}: ${error}` };
    }
    // Imported bakes aren't linked to a recipe (the names may not match).
    rows.push(toBakeRow({ ...bake, recipeId: null }));
  }
  const supabase = await createClient();
  // One insert with every row: the database adds them all or none.
  const { error } = await supabase.from("bakes").insert(rows);
  if (error) {
    console.error("Importing bakes failed:", error.message);
    return { error: "The import couldn’t be saved. Nothing was added. Try again in a moment." };
  }
  return { count: rows.length };
}
