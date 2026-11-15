// The signed-in person's preferences (default units and diet), from the
// "preferences" table. One shared store (lib/authStore.js), like
// lib/favourites.js, so every component sees a change straight away.
//
// Only client components can use this file.
import { useSyncExternalStore } from "react";
import { createAuthStore } from "@/lib/authStore";
import { createClient } from "@/lib/supabase/client";

const DEFAULT_PREFERENCES = { unitSystem: "grams", diet: "all" };

// status: "loading", "signed-out", "ready" or "error"
async function load(supabase, session, setState) {
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

const store = createAuthStore({ status: "loading", ...DEFAULT_PREFERENCES }, load);

// Returns { status, unitSystem, diet }.
export function usePreferences() {
  return useSyncExternalStore(store.subscribe, store.getState, store.getServerState);
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
  store.setState({ status: "ready", unitSystem, diet });
  return null;
}
