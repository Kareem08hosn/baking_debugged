// A small shared store for data that belongs to the signed-in person
// (lib/favourites.js and lib/preferences.js both use it).
//
// Several components need the same data at once, so it lives in ONE store
// outside React. useSyncExternalStore (see the hooks in those two files)
// lets a component read the store and redraw when it changes.
//
// "loading" is the first state, and the one the server draws: the server
// never knows who is signed in. "load" runs when the page starts and again
// every time someone signs in or out; it calls setState with the new state.
//
// Only client components can use this file.
import { createClient } from "@/lib/supabase/client";

export function createAuthStore(loading, load) {
  let state = loading;
  const listeners = new Set();
  let started = false;

  function setState(next) {
    state = next;
    listeners.forEach((callback) => callback());
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
      setTimeout(() => load(supabase, session, setState), 0);
    });
  }

  return {
    getState: () => state,
    setState,
    subscribe(callback) {
      start();
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    // Must be the SAME object every time, or React thinks it keeps changing.
    getServerState: () => loading,
  };
}
