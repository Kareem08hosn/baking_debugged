"use client";

import { useState } from "react";
import { savePreferences, usePreferences } from "@/lib/preferences";
import { UNIT_SYSTEMS } from "@/lib/units";

const DIETS = [
  { id: "all", label: "Show everything" },
  { id: "vegetarian", label: "Vegetarian only" },
  { id: "vegan", label: "Vegan only" },
];

// Default units and diet, saved to the person's account.
export default function PreferencesForm() {
  const preferences = usePreferences();
  // What's picked in the form. null = not touched yet: show the saved value.
  const [unitSystem, setUnitSystem] = useState(null);
  const [diet, setDiet] = useState(null);
  const [status, setStatus] = useState("idle"); // "idle", "saving", "saved" or an error

  if (preferences.status === "loading") {
    return <p className="font-mono text-muted">Loading your preferences…</p>;
  }

  const shownUnits = unitSystem ?? preferences.unitSystem;
  const shownDiet = diet ?? preferences.diet;

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("saving");
    const error = await savePreferences({ unitSystem: shownUnits, diet: shownDiet });
    setStatus(error ?? "saved");
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <fieldset>
        <legend className="label">Units on recipe pages</legend>
        <div className="segmented mt-1.5 max-w-md">
          {UNIT_SYSTEMS.map((system) => (
            <label key={system.id}>
              <input
                type="radio"
                name="pref-units"
                value={system.id}
                checked={shownUnits === system.id}
                onChange={() => {
                  setUnitSystem(system.id);
                  setStatus("idle");
                }}
              />
              <span>{system.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="pref-diet" className="label block">Recipe list starts with</label>
        <select
          id="pref-diet"
          className="field mt-1.5 max-w-xs"
          value={shownDiet}
          onChange={(event) => {
            setDiet(event.target.value);
            setStatus("idle");
          }}
        >
          {DIETS.map((item) => (
            <option key={item.id} value={item.id}>{item.label}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="btn-quiet" disabled={status === "saving"}>
          {status === "saving" ? "Saving…" : "Save preferences"}
        </button>
        <span role="status" className="font-mono text-sm text-muted">
          {status === "saved" ? "Saved" : ""}
        </span>
      </div>
      {!["idle", "saving", "saved"].includes(status) && (
        <p role="alert" className="alert">{status}</p>
      )}
      <p className="text-sm text-muted">You can still switch units or filters on any page.</p>
    </form>
  );
}
