"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBake, deleteBake, updateBake } from "@/app/bakes/actions";
import { BAKE_FIELDS, bakeFromRecipe, readNumber, today } from "@/lib/bakes";
import { fetchMyRecipe } from "@/lib/myRecipes";

// Looks up a field's settings (label, unit...) in BAKE_FIELDS by its key.
function field(key) {
  return BAKE_FIELDS.find((item) => item.key === key);
}

// The form shows fields in three groups. The keys match BAKE_FIELDS.
const MEASUREMENTS = ["flourG", "waterG", "sugarG", "fatG", "hydrationPct", "ovenTempC", "bakeTimeMin"];
const RESULTS = ["rise", "texture"];
const LONG_TEXT = ["whatWentWrong", "notes"];

// A bake's values as form text: numbers become "500", null becomes "".
function toFormValues(bake) {
  const values = { recipeId: bake?.recipeId ? String(bake.recipeId) : "" };
  for (const item of BAKE_FIELDS) {
    const value = bake?.[item.key];
    values[item.key] = value === null || value === undefined ? "" : String(value);
  }
  // A new bake's date is left empty here: this runs on the server too,
  // which works in UTC, where it can already be tomorrow on a Montreal
  // evening. An empty date becomes the browser's own "today" on saving.
  return values;
}

// The form for logging a bake (bake = null) or editing one.
//   recipes   [{ id, name }] to choose from
//   prefill   values to start a NEW bake with (from ?recipe=...), or null
export default function BakeForm({ bake = null, recipes, prefill = null }) {
  const router = useRouter();
  const isEditing = bake !== null;
  const [values, setValues] = useState(() => toFormValues(bake ?? prefill));
  const [status, setStatus] = useState("idle"); // "idle", "saving", "loading-recipe", "confirm-delete" or an error

  function set(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  // Choosing a recipe fills in its name and measurements.
  async function chooseRecipe(id) {
    set("recipeId", id);
    if (id === "") {
      return;
    }
    setStatus("loading-recipe");
    const recipe = await fetchMyRecipe(id);
    setStatus("idle");
    if (!recipe) {
      return;
    }
    const filled = bakeFromRecipe(recipe);
    // The updater form of setValues (current => ...) works from the newest
    // values, even though time has passed while the recipe loaded.
    setValues((current) => {
      const next = { ...current, recipeId: id };
      for (const [key, value] of Object.entries(filled)) {
        if (key !== "recipeId" && value !== null) {
          next[key] = String(value);
        }
      }
      return next;
    });
  }

  // What hydration would be from the flour and water typed in, if both are
  // there. Shown as a hint and used when the hydration box is left empty.
  const flour = readNumber(values.flourG);
  const water = readNumber(values.waterG);
  const workedOutHydration =
    // (null >= 0 is true in JavaScript, so null is ruled out first)
    flour > 0 && water !== null && water >= 0 ? Math.round((water / flour) * 1000) / 10 : null;

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("saving");
    const input = {
      ...values,
      // today() here runs in the browser, so it's the baker's own date
      bakedOn: values.bakedOn || today(),
      hydrationPct: values.hydrationPct === "" && workedOutHydration !== null ? workedOutHydration : values.hydrationPct,
    };
    const result = isEditing ? await updateBake(bake.id, input) : await createBake(input);
    if (result.error) {
      setStatus(result.error);
      return;
    }
    router.push("/bakes");
    router.refresh(); // fetch the log again so the new bake shows
  }

  async function handleDelete() {
    setStatus("saving");
    const result = await deleteBake(bake.id);
    if (result.error) {
      setStatus(result.error);
      return;
    }
    router.push("/bakes");
    router.refresh();
  }

  // One labelled input for a field from BAKE_FIELDS
  function input(key, extra = {}) {
    const item = field(key);
    const isNumber = item.type === "number";
    return (
      <div key={key}>
        <label htmlFor={`bake-${key}`} className="label block">
          {item.label}
          {item.unit && <span className="normal-case tracking-normal"> ({item.unit})</span>}
        </label>
        <input
          id={`bake-${key}`}
          className={`field mt-1 ${isNumber ? "font-mono font-bold tabular-nums" : ""}`}
          type={item.type === "date" ? "date" : isNumber ? "number" : "text"}
          inputMode={isNumber ? "decimal" : undefined}
          step={isNumber ? "any" : undefined}
          min={isNumber ? item.min : undefined}
          max={isNumber ? item.max : undefined}
          maxLength={item.type === "text" ? item.max : undefined}
          value={values[key]}
          onChange={(event) => set(key, event.target.value)}
          {...extra}
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-10">
      {/* ---------- What and when ---------- */}
      <fieldset className="note tape panel">
        <legend className="sr-only">What and when</legend>
        <h2 className="panel-title">What and when</h2>
        <div className="mt-5 grid gap-4">
          <div>
            <label htmlFor="bake-recipe" className="label block">From a recipe (optional)</label>
            <select
              id="bake-recipe"
              className="field mt-1"
              value={values.recipeId}
              onChange={(event) => chooseRecipe(event.target.value)}
            >
              <option value="">none: my own bake</option>
              {recipes.map((recipe) => (
                <option key={recipe.id} value={recipe.id}>{recipe.name}</option>
              ))}
            </select>
            <p className="mt-1.5 text-sm text-muted" aria-live="polite">
              {status === "loading-recipe"
                ? "Filling in the recipe’s measurements…"
                : "Choosing a recipe fills in its measurements. Change them to what you actually used."}
            </p>
          </div>
          {input("title", { required: true, placeholder: "Sourdough, attempt 4" })}
          <div className="grid grid-cols-2 gap-4">
            <div>
              {input("bakedOn", { "aria-describedby": "bake-date-hint" })}
              <p id="bake-date-hint" className="mt-1 text-xs text-muted">Leave empty for today.</p>
            </div>
            {input("rating", { placeholder: "1–5" })}
          </div>
        </div>
      </fieldset>

      {/* ---------- Measurements ---------- */}
      <fieldset className="note tape panel">
        <legend className="sr-only">Measurements</legend>
        <h2 className="panel-title">Measurements</h2>
        <div className="graph mt-5 grid grid-cols-2 gap-4 border-[1.5px] border-foreground p-3.5 sm:grid-cols-4">
          {MEASUREMENTS.map((key) =>
            input(key, key === "hydrationPct" && workedOutHydration !== null ? { placeholder: String(workedOutHydration) } : {})
          )}
        </div>
        <div className="mt-4">{input("leavener", { placeholder: "instant yeast, starter, baking soda…" })}</div>
        {workedOutHydration !== null && values.hydrationPct === "" && (
          <p className="mt-2 text-sm text-muted">
            Hydration left empty: it will be saved as {workedOutHydration}% (water ÷ flour).
          </p>
        )}
      </fieldset>

      {/* ---------- What happened ---------- */}
      <fieldset className="note tape panel">
        <legend className="sr-only">What happened</legend>
        <h2 className="panel-title">What happened</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {RESULTS.map((key) => input(key, { placeholder: key === "rise" ? "doubled in 3 h; spread 2 cm" : "open, a bit gummy" }))}
        </div>
        <div className="mt-4 grid gap-4">
          {LONG_TEXT.map((key) => (
            <div key={key}>
              <label htmlFor={`bake-${key}`} className="label block">{field(key).label}</label>
              <textarea
                id={`bake-${key}`}
                className="field note-ruled mt-1 bg-[position:0_7px] leading-7"
                rows="3"
                maxLength={field(key).max}
                value={values[key]}
                onChange={(event) => set(key, event.target.value)}
              />
            </div>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <button type="submit" className="btn" disabled={status === "saving"}>
          {status === "saving" ? "Saving…" : isEditing ? "Save changes" : "Log this bake"}
        </button>
        {isEditing && status !== "confirm-delete" && (
          <button type="button" className="btn-quiet" onClick={() => setStatus("confirm-delete")}>
            Delete this bake
          </button>
        )}
        {status === "confirm-delete" && (
          <span className="flex flex-wrap items-center gap-3" role="group" aria-label="Confirm delete">
            <span className="font-mono text-sm font-bold">Delete it for good?</span>
            <button type="button" className="btn-quiet" onClick={handleDelete}>Yes, delete</button>
            <button type="button" className="font-mono text-sm underline underline-offset-4" onClick={() => setStatus("idle")}>
              Keep it
            </button>
          </span>
        )}
      </div>

      {!["idle", "saving", "loading-recipe", "confirm-delete"].includes(status) && (
        <p role="alert" className="alert">{status}</p>
      )}
    </form>
  );
}
