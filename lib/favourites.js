// The signed-in person's favourites (recipes saved with the Save button),
// kept in the database table "favourites" (supabase/add-favourites.sql).
//
// Several components need the same list at once (the Save button, the
// "saved" tab on /recipes), so it lives in one shared store
// (lib/authStore.js), not in each component.
//
// Only client components can use this file.
import { useSyncExternalStore } from "react";
import { createAuthStore } from "@/lib/authStore";
import { createClient } from "@/lib/supabase/client";

// "status" is "loading", "signed-out", "ready" or "error";
// "ids" is the list of saved recipe ids.
// Counts loads, so an older, slower load can't overwrite a newer one.
let loadNumber = 0;

async function load(supabase, session, setState) {
  loadNumber += 1;
  const thisLoad = loadNumber;

  if (!session) {
    setState({ status: "signed-out", ids: [] });
    return;
  }
  const { data, error } = await supabase.from("favourites").select("recipe_id");
  if (thisLoad !== loadNumber) {
    return; // a newer load has started since; let that one win
  }
  if (error) {
    console.error("Loading favourites failed:", error.message);
    setState({ status: "error", ids: [] });
  } else {
    setState({ status: "ready", ids: data.map((row) => row.recipe_id) });
  }
}

const store = createAuthStore({ status: "loading", ids: [] }, load);

// Returns { status, ids } and redraws the component when it changes.
export function useFavourites() {
  return useSyncExternalStore(store.subscribe, store.getState, store.getServerState);
}

// Saves the recipe if it isn't saved yet, removes it if it is.
// The list changes straight away ("optimistic"), then the database is told;
// if that fails, the change is undone. Returns an error message or null.
export async function toggleFavourite(recipeId) {
  const before = store.getState();
  if (before.status !== "ready") {
    return "Sign in to save recipes.";
  }
  const isSaved = before.ids.includes(recipeId);
  store.setState({
    ...before,
    ids: isSaved ? before.ids.filter((id) => id !== recipeId) : [...before.ids, recipeId],
  });

  const favourites = createClient().from("favourites");
  const { error } = isSaved
    ? await favourites.delete().eq("recipe_id", recipeId)
    : await favourites.insert({ recipe_id: recipeId });

  if (error) {
    console.error("Saving a favourite failed:", error.message);
    store.setState(before); // put the list back as it was
    return "That didn’t save. Try again in a moment.";
  }
  return null;
}
