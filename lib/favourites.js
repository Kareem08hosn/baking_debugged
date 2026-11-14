// The signed-in person's favourites (recipes saved with the Save button),
// kept in the database table "favourites" (supabase/add-favourites.sql).
//
// Several components need the same list at once (the Save button, the
// "saved" tab on /recipes), so it lives in ONE shared store in this file,
// not in each component. The same pattern as lib/theme.js:
// useSyncExternalStore lets React components read a value that lives
// outside React and redraw when it changes.
//
// Only client components can use this file.
import { useSyncExternalStore } from "react";
import { createClient } from "@/lib/supabase/client";

// Where the old browser-only bookmarks were kept (before this table existed).
const OLD_BOOKMARKS_KEY = "baking-debugged:bookmarks";

// The current state. "status" is "loading", "signed-out", "ready" or "error";
// "ids" is the list of saved recipe ids.
let state = { status: "loading", ids: [] };
const listeners = new Set();
let started = false;
// Counts loads, so an older, slower load can't overwrite a newer one.
let loadNumber = 0;

// The server never knows who is signed in, so it always draws "loading".
// It must be the SAME object every time, or React thinks it keeps changing.
const SERVER_STATE = { status: "loading", ids: [] };

function setState(next) {
  state = next;
  listeners.forEach((callback) => callback());
}

// Moves bookmarks saved in this browser (from before accounts) into the
// database, then forgets them. Each is added on its own, so one that can't
// be saved (a recipe that no longer exists) doesn't stop the rest.
async function moveOldBookmarks(supabase) {
  let ids = [];
  try {
    ids = JSON.parse(localStorage.getItem(OLD_BOOKMARKS_KEY) ?? "[]");
  } catch {
    ids = [];
  }
  if (!Array.isArray(ids) || ids.length === 0) {
    return;
  }
  // Keep the ones that couldn't be moved, so nothing is lost. A recipe
  // that no longer exists fails with a "foreign key" error (code 23503):
  // that one is dropped, since there's nothing left to save.
  const notMoved = [];
  for (const id of ids) {
    // upsert with ignoreDuplicates: add it unless it is already saved
    const { error } = await supabase
      .from("favourites")
      .upsert({ recipe_id: id }, { onConflict: "user_id,recipe_id", ignoreDuplicates: true });
    if (error && error.code !== "23503") {
      notMoved.push(id);
    }
  }
  if (notMoved.length === 0) {
    localStorage.removeItem(OLD_BOOKMARKS_KEY);
  } else {
    // e.g. the favourites table doesn't exist yet: try again next time
    localStorage.setItem(OLD_BOOKMARKS_KEY, JSON.stringify(notMoved));
  }
}

async function load(supabase, session) {
  loadNumber += 1;
  const thisLoad = loadNumber;

  if (!session) {
    setState({ status: "signed-out", ids: [] });
    return;
  }
  await moveOldBookmarks(supabase);
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

// Starts listening to sign-in changes the first time any component asks.
function start() {
  if (started) {
    return;
  }
  started = true;
  const supabase = createClient();
  supabase.auth.onAuthStateChange((event, session) => {
    // Supabase warns against calling it from inside this listener, so the
    // work runs a moment later (see lib/myRecipes.js).
    setTimeout(() => load(supabase, session), 0);
  });
}

function subscribe(callback) {
  start();
  listeners.add(callback);
  return () => listeners.delete(callback);
}

// Returns { status, ids } and redraws the component when it changes.
export function useFavourites() {
  return useSyncExternalStore(subscribe, () => state, () => SERVER_STATE);
}

// Saves the recipe if it isn't saved yet, removes it if it is.
// The list changes straight away ("optimistic"), then the database is told;
// if that fails, the change is undone. Returns an error message or null.
export async function toggleFavourite(recipeId) {
  if (state.status !== "ready") {
    return "Sign in to save recipes.";
  }
  const before = state;
  const isSaved = state.ids.includes(recipeId);
  setState({
    ...state,
    ids: isSaved ? state.ids.filter((id) => id !== recipeId) : [...state.ids, recipeId],
  });

  const favourites = createClient().from("favourites");
  const { error } = isSaved
    ? await favourites.delete().eq("recipe_id", recipeId)
    : await favourites.insert({ recipe_id: recipeId });

  if (error) {
    console.error("Saving a favourite failed:", error.message);
    setState(before); // put the list back as it was
    return "That didn’t save. Try again in a moment.";
  }
  return null;
}
