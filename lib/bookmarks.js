// Recipes the visitor has saved ("bookmarked"), as a list of recipe ids.
// Kept in this browser's localStorage for now. Once accounts are used for
// favourites (Phase 3, step 10) this moves to the database.
//
// Same pattern as lib/savedRecipes.js; see the comments there.
import { useSyncExternalStore } from "react";

const STORAGE_KEY = "baking-debugged:bookmarks";

const listeners = new Set();

function subscribe(callback) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot() {
  return localStorage.getItem(STORAGE_KEY) ?? "[]";
}

// null on the server: "not loaded yet"
function getServerSnapshot() {
  return null;
}

function parseIds(json) {
  try {
    const value = JSON.parse(json);
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

// Returns the saved ids, or null until the browser has loaded them.
export function useBookmarks() {
  const json = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return json === null ? null : parseIds(json);
}

// Saves the recipe if it isn't saved, removes it if it is.
export function toggleBookmark(id) {
  const ids = parseIds(getSnapshot());
  const next = ids.includes(id)
    ? ids.filter((savedId) => savedId !== id)
    : [...ids, id];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  listeners.forEach((callback) => callback());
}
