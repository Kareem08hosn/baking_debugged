// Reading the signed-in person's bake log on the server. Pages that use
// these are built for each request (they depend on who is signed in).
import { fromBakeRow } from "@/lib/bakes";
import { getRecipes } from "@/lib/recipes";
import { createClient, getUser } from "@/lib/supabase/server";

// All of the person's bakes, newest first. [] if nobody is signed in.
export async function getMyBakes() {
  const user = await getUser();
  if (!user) {
    return [];
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bakes")
    .select("*")
    .eq("user_id", user.id)
    .order("baked_on", { ascending: false })
    .order("id", { ascending: false });
  if (error) {
    throw new Error(`Could not load your bakes: ${error.message}`);
  }
  return data.map(fromBakeRow);
}

// One of the person's bakes, or null.
export async function getMyBake(id) {
  const bakeId = Number(id);
  const user = await getUser();
  if (!user || !Number.isInteger(bakeId)) {
    return null;
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bakes")
    .select("*")
    .eq("id", bakeId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) {
    throw new Error(`Could not load bake ${bakeId}: ${error.message}`);
  }
  return data === null ? null : fromBakeRow(data);
}

// Every recipe the person can pick when logging a bake: the site's and
// their own, as { id, name }, A to Z.
export async function getRecipeChoices() {
  const user = await getUser();
  const siteRecipes = await getRecipes();
  let ownRecipes = [];
  if (user) {
    const supabase = await createClient();
    const { data } = await supabase.from("recipes").select("id, name").eq("owner", user.id);
    ownRecipes = data ?? [];
  }
  return [...siteRecipes, ...ownRecipes]
    .map((recipe) => ({ id: recipe.id, name: recipe.name }))
    .toSorted((a, b) => a.name.localeCompare(b.name));
}
