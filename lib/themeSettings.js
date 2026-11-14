// Theme settings shared by the server (app/layout.js) and the browser
// (lib/theme.js). They live in their own file because layout.js is a server
// component and isn't allowed to import lib/theme.js, which uses a
// browser-only React hook.

// The name the choice is saved under in localStorage.
export const THEME_STORAGE_KEY = "baking-debugged:theme";
// Used until the visitor picks something: "light", "dark" or "system".
export const DEFAULT_THEME = "system";
