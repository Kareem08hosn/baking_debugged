"use client";

import { setTheme, useTheme } from "@/lib/theme";

// The Light / Dark / System dropdown in the header.
export default function ThemeToggle() {
  const theme = useTheme();

  return (
    <label className="flex items-center gap-2">
      Theme
      {/* The header's colours are inverted (see SiteHeader), so this uses
          border-background where the rest of the site uses border-line. */}
      <select
        className="rounded border border-background/40 bg-foreground p-1 text-background"
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
