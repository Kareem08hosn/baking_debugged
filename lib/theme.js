// The visitor's theme choice: "light", "dark" or "system" (follow the device).
// It is saved in localStorage so it is remembered on the next visit, and
// applied by setting data-theme on <html>, which globals.css reads.
//
// Only client components can use this file (the server has no localStorage).
import { useSyncExternalStore } from "react";
import { DEFAULT_THEME, THEME_STORAGE_KEY } from "@/lib/themeSettings";

// A list of functions to call when the value changes, so React can redraw.
const listeners = new Set();

function subscribe(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot() {
  return localStorage.getItem(THEME_STORAGE_KEY) ?? DEFAULT_THEME;
}

// The server can't know the visitor's choice, so it assumes the default.
function getServerSnapshot() {
  return DEFAULT_THEME;
}

// Custom hook: returns the current choice and redraws when it changes.
export function useTheme() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function setTheme(theme) {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  // document.documentElement is the <html> element; dataset.theme is its
  // data-theme attribute.
  document.documentElement.dataset.theme = theme;
  listeners.forEach((callback) => callback());
}
