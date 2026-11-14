"use client";

import { setTheme, useTheme } from "@/lib/theme";

// The Light / Dark / System dropdown in the footer.
export default function ThemeToggle() {
  const theme = useTheme();

  return (
    <label className="flex items-center gap-2">
      Theme
      <select
        className="field-inline"
        value={theme}
        onChange={(event) => setTheme(event.target.value)}
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
    </label>
  );
}
