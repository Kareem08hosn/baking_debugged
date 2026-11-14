// Server actions for people's own recipes: functions the browser can call,
// which run on the server (see app/login/actions.js for the idea).
"use server";

import { toRow } from "@/lib/recipeRows";
import { createClient, getUser } from "@/lib/supabase/server";
import { validateRecipe } from "@/lib/validateRecipe";

// Saves a new recipe for the signed-in person.
// Returns { id } of the new recipe, or { error: "message" }.
export async function createRecipe(input) {
  // getUser checks the sign-in token, so this can be trusted.
  const user = await getUser();
  if (!user) {
    return { error: "Sign in to save recipes." };
  }

  // Never trust what the browser sends: check it again here.
  const { recipe, error } = validateRecipe(input);
  if (error) {
    return { error };
  }

  // This client acts as the signed-in person, so the database's policies
  // (supabase/add-recipe-owners.sql) apply: the owner column is filled in
  // with their id, and they can't save a recipe under anyone else's.
  const supabase = await createClient();
  const { data, error: dbError } = await supabase
    .from("recipes")
    .insert(toRow(recipe))
    .select("id") // send back the id the database gave it
    .single();

  if (dbError) {
    // Details go to the server log; the person gets a plain message.
    console.error("Saving a recipe failed:", dbError.message);
    return { error: "The recipe couldn’t be saved. Try again in a moment." };
  }
  return { id: data.id };
}

// Saves changes to one of the signed-in person's recipes.
// Returns { id }, or { error: "message" }.
export async function updateRecipe(id, input) {
  const user = await getUser();
  if (!user) {
    return { error: "Sign in to change recipes." };
  }
  if (!Number.isInteger(id)) {
    return { error: "That recipe doesn’t exist." };
  }
  const { recipe, error } = validateRecipe(input);
  if (error) {
    return { error };
  }

  const supabase = await createClient();
  // As with delete: the policies only allow changing your own rows, and
  // .select("id") tells us whether any row was actually changed.
  const { data, error: dbError } = await supabase
    .from("recipes")
    .update(toRow(recipe))
    .eq("id", id)
    .eq("owner", user.id)
    .select("id");

  if (dbError) {
    console.error("Updating a recipe failed:", dbError.message);
    return { error: "The changes couldn’t be saved. Try again in a moment." };
  }
  if (data.length === 0) {
    return { error: "That recipe doesn’t exist, or isn’t yours." };
  }
  return { id };
}

// Deletes one of the signed-in person's recipes.
// Returns {} when done, or { error: "message" }.
export async function deleteRecipe(id) {
  const user = await getUser();
  if (!user) {
    return { error: "Sign in to delete recipes." };
  }
  if (!Number.isInteger(id)) {
    return { error: "That recipe doesn’t exist." };
  }

  const supabase = await createClient();
  // The policies only allow deleting your own rows. .eq("owner", ...) says
  // the same thing here too, so the intent is clear when reading the code.
  // .select("id") returns the deleted rows, so we can tell if nothing matched.
  const { data, error } = await supabase
    .from("recipes")
    .delete()
    .eq("id", id)
    .eq("owner", user.id)
    .select("id");

  if (error) {
    console.error("Deleting a recipe failed:", error.message);
    return { error: "The recipe couldn’t be deleted. Try again in a moment." };
  }
  if (data.length === 0) {
    return { error: "That recipe doesn’t exist, or isn’t yours." };
  }
  return {};
}
