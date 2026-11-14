// Recipes added through the form. Until the database exists (Phase 3) they
// are kept in localStorage: a small key/value store inside the visitor's
// browser. It survives a refresh, but only on that browser and device.
//
// Only client components can use this file, because the server has no
// localStorage.
import { useSyncExternalStore } from "react";

const STORAGE_KEY = "baking-debugged:recipes";

// Functions to call when the saved recipes change, so React can redraw.
const listeners = new Set();

// React calls this to start listening for changes. It returns a function
// that stops listening, which React calls when the component goes away.
function subscribe(callback) {
  listeners.add(callback);
  // "storage" fires when another tab changes localStorage.
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

// React calls this to read the current value. localStorage only stores text,
// so the recipes are kept as a JSON string.
function getSnapshot() {
  // ?? means "use the right side if the left side is null" (nothing saved yet)
  return localStorage.getItem(STORAGE_KEY) ?? "[]";
}

// What to use while the page is still being built on the server.
// null means "not loaded yet".
function getServerSnapshot() {
  return null;
}

// JSON text -> array of recipes. Bad or missing data becomes an empty list.
function parseRecipes(json) {
  try {
    const value = JSON.parse(json);
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function writeRecipes(recipes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
  // Tell every listening component that the data changed.
  listeners.forEach((callback) => callback());
}

// A custom hook (a reusable function that uses React features; hook names
// start with "use"). Returns the saved recipes, or null until the browser
// has loaded them. The component redraws whenever they change.
export function useSavedRecipes() {
  const json = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return json === null ? null : parseRecipes(json);
}

export function addSavedRecipe(recipe) {
  writeRecipes([...parseRecipes(getSnapshot()), recipe]);
}

export function deleteSavedRecipe(id) {
  writeRecipes(
    parseRecipes(getSnapshot()).filter((recipe) => recipe.id !== id)
  );
}
