// The signed-in person's own recipes, fetched in the browser.
//
// They are private, so the pages that are built once for everyone can't
// include them. Instead, client components call these after the page loads,
// with the browser's Supabase client, which carries the sign-in cookie.
// The database's policies make sure only the owner gets their rows.
// Only client components can use this file.

import { useEffect, useState } from "react";
import { MY_LIST_COLUMNS, fromRow } from "@/lib/recipeRows";
import { createClient } from "@/lib/supabase/client";

// Returns { status, userId, recipes }:
//   status "loading"    not known yet
//   status "signed-out" nobody is signed in (recipes is empty)
//   status "ready"      recipes holds the person's recipes
//   status "error"      the request failed (recipes is empty)
export function useMyRecipes() {
  const [state, setState] = useState({ status: "loading", userId: null, recipes: [] });

  useEffect(() => {
    const supabase = createClient();
    // "ignore" stops a slow answer from overwriting a newer one if the
    // person signs out (or the component disappears) while it is loading.
    let ignore = false;

    async function load(session) {
      if (!session) {
        setState({ status: "signed-out", userId: null, recipes: [] });
        return;
      }
      const userId = session.user.id;
      const { data, error } = await supabase
        .from("recipes")
        .select(MY_LIST_COLUMNS)
        .eq("owner", userId)
        .order("id");
      if (ignore) {
        return;
      }
      if (error) {
        console.error("Loading your recipes failed:", error.message);
        setState({ status: "error", userId, recipes: [] });
      } else {
        setState({ status: "ready", userId, recipes: data.map(fromRow) });
      }
    }

    // Called once straight away, and again on sign-in or sign-out.
    // Supabase warns against calling it again from inside this listener (it
    // can lock up), so setTimeout runs load a moment later, outside it.
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setTimeout(() => load(session), 0);
    });
    return () => {
      ignore = true;
      data.subscription.unsubscribe();
    };
  }, []);

  return state;
}

// Fetches one of the person's recipes by id, with its instructions.
// Returns the recipe, or null if there is none they can see.
export async function fetchMyRecipe(id) {
  const recipeId = Number(id);
  if (!Number.isInteger(recipeId)) {
    return null;
  }
  const { data, error } = await createClient()
    .from("recipes")
    .select("*")
    .eq("id", recipeId)
    .maybeSingle();
  if (error) {
    console.error("Loading a recipe failed:", error.message);
    return null;
  }
  return data === null ? null : fromRow(data);
}
