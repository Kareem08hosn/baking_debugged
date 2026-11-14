// A client component, because the servings box reacts to the user.
"use client";

import { useState } from "react";
import { getPanById, pans } from "@/lib/pans";
import { formatAmount } from "@/lib/recipes";
import {
  bakersPercentages,
  hydration,
  panScaleFactor,
  scaleRecipe,
} from "@/lib/scaler";

// One box in the row of key numbers at the top of a recipe.
function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-3">
      {/* <dt> is the term and <dd> its value, inside the <dl> list below */}
      <dt className="font-mono text-xs uppercase tracking-wide text-muted">
        {label}
      </dt>
      <dd className="font-mono text-lg font-bold">{value}</dd>
    </div>
  );
}

// Shows one full recipe, with a servings box that rescales the ingredients.
// It is shared by the built-in recipes and the ones saved in the browser.
export default function RecipeDetail({ recipe }) {
  // What the user has typed in the servings box. Inputs always hold text, so
  // this is text ("12"), and it starts as the recipe's own servings.
  const [servingsText, setServingsText] = useState(String(recipe.servings));

  // The pan the recipe was written for, or undefined if it has none (cookies,
  // a free-form loaf, or a recipe saved before pans existed).
  const originalPan = getPanById(recipe.pan);
  // The pan picked in the dropdown. "" means none is picked, which happens
  // when the servings were typed by hand and no longer match any pan.
  const [panId, setPanId] = useState(originalPan ? originalPan.id : "");

  // While the box is empty or holds something unusable ("", "0", "-3"), keep
  // showing the original recipe instead of an error.
  const servings = Number(servingsText);
  const isValid = servings > 0;
  const shown = isValid ? scaleRecipe(recipe, servings) : recipe;
  const isScaled = shown.servings !== recipe.servings;

  // Baker's percentages are ratios, so they are the same at any size. They
  // are worked out from the original amounts to avoid rounding drift.
  const percentages = bakersPercentages(recipe);
  const recipeHydration = hydration(recipe);

  // Typing a number of servings: that amount no longer matches a pan, unless
  // it is the original amount.
  function handleServingsChange(event) {
    const text = event.target.value;
    setServingsText(text);
    const isOriginal = Number(text) === recipe.servings;
    setPanId(isOriginal && originalPan ? originalPan.id : "");
  }

  // Picking a pan: work out how many servings fit in it and put that in the
  // servings box. The table then rescales exactly as if it had been typed.
  function handlePanChange(event) {
    const newPan = getPanById(event.target.value);
    const factor = panScaleFactor(originalPan, newPan);
    // Keep one decimal place: a pan 1.39x the size makes 13.9 servings
    const newServings = Math.round(recipe.servings * factor * 10) / 10;
    setPanId(newPan.id);
    setServingsText(String(newServings));
  }

  function handleReset() {
    setServingsText(String(recipe.servings));
    setPanId(originalPan ? originalPan.id : "");
  }

  // Find an ingredient's percentage by name. Ingredients measured by count
  // (eggs) have none, so they get an empty cell.
  function percentFor(ingredient) {
    const row = percentages.find((row) => row.name === ingredient.name);
    return row ? `${row.percent}%` : "";
  }

  return (
    // <>...</> is a Fragment: it groups elements without adding an extra <div>
    <>
      <p className="mt-4 font-mono text-xs uppercase tracking-wide text-muted">
        {recipe.category} · {recipe.difficulty}
        {/* Only show the diets if the recipe has any */}
        {recipe.diet.length > 0 && ` · ${recipe.diet.join(", ")}`}
      </p>
      <h1 className="mt-1 font-mono text-3xl font-bold">{recipe.name}</h1>

      {/* Key numbers: 2 per row on phones, all 5 in one row from "sm" up */}
      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Stat label="Serves" value={shown.servings} />
        <Stat label="Prep" value={`${recipe.prepTime} min`} />
        <Stat label="Bake" value={`${recipe.bakeTime} min`} />
        <Stat label="Total" value={`${recipe.prepTime + recipe.bakeTime} min`} />
        <Stat label="Rating" value={`★ ${recipe.rating}`} />
      </dl>

      {/* On phones the two sections stack. From "md" up they sit side by
          side: ingredients take 2 of 5 columns, instructions take 3. */}
      <div className="mt-8 grid gap-8 md:grid-cols-5">
        {/* min-w-0 lets the column shrink below the width of its widest
            child (the pan dropdown), so narrow phones don't scroll sideways */}
        <section className="min-w-0 md:col-span-2">
          <h2 className="mb-3 font-mono text-xl font-bold">Ingredients</h2>

          {/* The scaling controls: by servings, or by pan */}
          <div className="mb-3 flex flex-wrap items-center gap-2 font-mono text-sm">
            <label className="flex items-center gap-2">
              Servings
              <input
                className="w-20 rounded border border-line bg-surface p-1"
                type="number"
                min="1"
                step="any"
                value={servingsText}
                onChange={handleServingsChange}
              />
            </label>
            {/* Only offer Reset once the number has been changed */}
            {servingsText !== String(recipe.servings) && (
              <button
                type="button"
                className="rounded border border-line bg-surface px-2 py-1 hover:border-foreground"
                onClick={handleReset}
              >
                Reset to {recipe.servings}
              </button>
            )}
          </div>

          {/* Only recipes that are baked in a pan can be scaled to another */}
          {originalPan && (
            <label className="mb-3 flex items-center gap-2 font-mono text-sm">
              Pan
              <select
                className="min-w-0 flex-1 rounded border border-line bg-surface p-1"
                value={panId}
                onChange={handlePanChange}
              >
                {/* Shown when the servings were typed by hand. "disabled"
                    means it can be displayed but not picked. */}
                <option value="" disabled>
                  Choose a pan…
                </option>
                {pans.map((pan) => (
                  <option key={pan.id} value={pan.id}>
                    {pan.label}
                    {pan.id === originalPan.id && " (original)"}
                  </option>
                ))}
              </select>
            </label>
          )}

          {/* A real <table>, so screen readers can read it as rows and columns */}
          <table className="w-full rounded-lg border border-line bg-surface">
            <thead className="font-mono text-xs uppercase tracking-wide text-muted">
              <tr className="border-b border-line">
                <th className="px-4 py-2 text-left font-normal">Ingredient</th>
                <th className="px-2 py-2 text-right font-normal">Amount</th>
                {/* The baker's % column only exists if the recipe has flour */}
                {percentages.length > 0 && (
                  <th className="px-4 py-2 text-right font-normal">Baker’s %</th>
                )}
              </tr>
            </thead>
            <tbody>
              {/* map() also hands us each item's position (index). It is safe
                  to use as the key here because this list never reorders, and
                  two ingredients could share a name. */}
              {shown.ingredients.map((ingredient, index) => (
                // last:border-b-0 removes the divider under the final row
                <tr key={index} className="border-b border-line last:border-b-0">
                  <td className="px-4 py-2">{ingredient.name}</td>
                  <td className="whitespace-nowrap px-2 py-2 text-right font-mono">
                    {formatAmount(ingredient)}
                  </td>
                  {percentages.length > 0 && (
                    <td className="px-4 py-2 text-right font-mono text-muted">
                      {percentFor(ingredient)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Hydration only means something for doughs with water in them,
              so it is hidden when it is missing (no flour) or 0 (a cake). */}
          {recipeHydration > 0 && (
            <p className="mt-3 font-mono text-sm">
              Hydration: {recipeHydration}%
            </p>
          )}
          {percentages.length > 0 && (
            <p className="mt-1 text-sm text-muted">
              Baker’s % is each ingredient’s weight compared with the flour.
            </p>
          )}
          {isScaled && (
            <p className="mt-1 text-sm text-muted">
              Scaled from {recipe.servings} servings. Bake time and the amounts
              mentioned in the steps are for the original size.
              {/* Extra warning when the pan itself changed */}
              {originalPan &&
                panId !== "" &&
                panId !== originalPan.id &&
                " A different pan fills to the same depth, but check it early: bake time changes with the pan."}
            </p>
          )}
        </section>

        <section className="min-w-0 md:col-span-3">
          <h2 className="mb-3 font-mono text-xl font-bold">Instructions</h2>
          <ol className="space-y-4">
            {recipe.instructions.map((step, index) => (
              <li key={index} className="flex gap-4">
                {/* Step number as 01, 02...: padStart adds a leading zero
                    until the text is 2 characters long */}
                <span className="font-mono font-bold text-muted">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </>
  );
}
