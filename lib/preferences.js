// The signed-in person's preferences (default units and diet), from the
// "preferences" table. One shared store, like lib/favourites.js, so every
// component sees a change straight away.
//
// Only client components can use this file.
import { useSyncExternalStore } from "react";
import { createClient } from "@/lib/supabase/client";

export const DEFAULT_PREFERENCES = { unitSystem: "grams", diet: "all" };

// status: "loading", "signed-out", "ready" or "error"
let state = { status: "loading", ...DEFAULT_PREFERENCES };
const listeners = new Set();
let started = false;
const SERVER_STATE = { status: "loading", ...DEFAULT_PREFERENCES };

function setState(next) {
  state = next;
  listeners.forEach((callback) => callback());
}

async function load(supabase, session) {
  if (!session) {
    setState({ status: "signed-out", ...DEFAULT_PREFERENCES });
    return;
  }
  // maybeSingle: someone who never saved preferences has no row yet
  const { data, error } = await supabase
    .from("preferences")
    .select("unit_system, diet")
    .maybeSingle();
  if (error) {
    console.error("Loading preferences failed:", error.message);
    setState({ status: "error", ...DEFAULT_PREFERENCES });
    return;
  }
  setState({
    status: "ready",
    unitSystem: data?.unit_system ?? DEFAULT_PREFERENCES.unitSystem,
    diet: data?.diet ?? DEFAULT_PREFERENCES.diet,
  });
}

function start() {
  if (started) {
    return;
  }
  started = true;
  const supabase = createClient();
  supabase.auth.onAuthStateChange((event, session) => {
    setTimeout(() => load(supabase, session), 0); // see lib/myRecipes.js
  });
}

function subscribe(callback) {
  start();
  listeners.add(callback);
  return () => listeners.delete(callback);
}

// Returns { status, unitSystem, diet }.
export function usePreferences() {
  return useSyncExternalStore(subscribe, () => state, () => SERVER_STATE);
}

// Saves new preferences. Returns an error message or null.
// upsert = insert the row, or update it if it already exists.
export async function savePreferences({ unitSystem, diet }) {
  const { error } = await createClient()
    .from("preferences")
    .upsert(
      { unit_system: unitSystem, diet, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );
  if (error) {
    console.error("Saving preferences failed:", error.message);
    return "Your preferences couldn’t be saved. Try again in a moment.";
  }
  setState({ status: "ready", unitSystem, diet });
  return null;
}
