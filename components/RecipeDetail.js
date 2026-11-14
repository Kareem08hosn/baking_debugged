// A client component, because the servings box reacts to the user.
"use client";

import { useState } from "react";
import RatingStamp from "@/components/RatingStamp";
import { getPanById, pans } from "@/lib/pans";
import {
  bakersPercentages,
  hydration,
  panScaleFactor,
  scaleRecipe,
  showsHydration,
} from "@/lib/scaler";
import { UNIT_SYSTEMS, formatAmount, hasVolume } from "@/lib/units";

// One cell in the strip of key numbers under the title.
function Stat({ label, value }) {
  return (
    <div className="bg-surface px-4 py-2.5">
      {/* <dt> is the term and <dd> its value, inside the <dl> list below */}
      <dt className="label">{label}</dt>
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

  // Which units the Amount column shows: "grams", "us" or "ml".
  const [unitSystem, setUnitSystem] = useState("grams");

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
      {/* Title on the left, rating stamp on the right */}
      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="label">
            No. {String(recipe.id).padStart(2, "0")} · {recipe.category} ·{" "}
            {recipe.difficulty}
            {/* Only show the diets if the recipe has any */}
            {recipe.diet.length > 0 && ` · ${recipe.diet.join(", ")}`}
          </p>
          <h1 className="mt-1 font-mono text-[2rem] font-bold leading-tight sm:text-[2.75rem]">
            <span className="highlight">{recipe.name}</span>
          </h1>
          {/* Where the recipe was adapted from, and whether anyone has baked it yet */}
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
            {recipe.source && (
              <span>
                Adapted from{" "}
                <a
                  href={recipe.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {recipe.source.name}
                </a>
                {recipe.rating != null && recipe.tested === false &&
                  ` (rated ${recipe.rating}/5 there)`}
              </span>
            )}
            {recipe.tested === false && (
              <span className="label border border-line px-1.5 py-0.5">Untested</span>
            )}
          </p>
        </div>
        {/* flex-none stops the stamp being squashed by a long title */}
        <RatingStamp rating={recipe.rating} tested={recipe.tested} className="mt-1 flex-none" />
      </div>

      {/* Key numbers on a strip of paper: 2 per row on phones, 4 from "sm".
          The lines between the cells are a trick: the grid's own background
          is the line colour, each cell is paper-coloured, and gap-px leaves
          a 1px gap between cells for the background to show through. */}
      <dl className="note mt-5 grid grid-cols-2 gap-px bg-line sm:grid-cols-4">
        <Stat label="Serves" value={shown.servings} />
        <Stat label="Prep" value={`${recipe.prepTime} min`} />
        <Stat label="Bake" value={`${recipe.bakeTime} min`} />
        <Stat label="Total" value={`${recipe.prepTime + recipe.bakeTime} min`} />
      </dl>

      {/* On phones the two sections stack, ingredients first. From "md" up
          they sit side by side: ingredients take 2 of 5 columns,
          instructions take 3. */}
      <div className="mt-10 grid gap-10 md:grid-cols-5">
        {/* min-w-0 lets the column shrink below the width of its widest
            child (the pan dropdown), so narrow phones don't scroll sideways */}
        <section className="note tape min-w-0 self-start px-4 pb-4 pt-6 md:col-span-2">
          <h2 className="mb-3 font-mono text-xl font-bold">Ingredients</h2>

          {/* The scaling and unit controls. Each label sits above its field. */}
          <div className="mb-4 grid grid-cols-2 gap-3">
            <label className="label">
              Servings
              <input
                className="field mt-1 font-mono"
                type="number"
                min="1"
                step="any"
                // Shows a number keypad with a decimal point on phones
                inputMode="decimal"
                value={servingsText}
                onChange={handleServingsChange}
              />
            </label>

            <label className="label">
              Units
              <select
                className="field mt-1 font-mono"
                value={unitSystem}
                onChange={(event) => setUnitSystem(event.target.value)}
              >
                {UNIT_SYSTEMS.map((system) => (
                  <option key={system.id} value={system.id}>
                    {system.label}
                  </option>
                ))}
              </select>
            </label>

            {/* Only recipes that are baked in a pan can be scaled to another.
                col-span-2 makes this one as wide as both columns. */}
            {originalPan && (
              <label className="label col-span-2">
                Pan
                <select
                  className="field mt-1 font-mono"
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

            {/* Only offer Reset once the number has been changed */}
            {servingsText !== String(recipe.servings) && (
              <button
                type="button"
                className="btn-quiet col-span-2 justify-self-start"
                onClick={handleReset}
              >
                ↺ Reset to {recipe.servings} servings
              </button>
            )}
          </div>

          {/* A real <table>, so screen readers can read it as rows and columns */}
          <table className="w-full">
            <thead>
              <tr className="border-b-[1.5px] border-foreground">
                <th className="label py-1.5 text-left font-normal">Ingredient</th>
                <th className="label px-2 py-1.5 text-right font-normal">Amount</th>
                {/* The baker's % column only exists if the recipe has flour */}
                {percentages.length > 0 && (
                  <th className="label py-1.5 text-right font-normal">Baker’s %</th>
                )}
              </tr>
            </thead>
            <tbody>
              {/* map() also hands us each item's position (index). It is safe
                  to use as the key here because this list never reorders, and
                  two ingredients could share a name. */}
              {shown.ingredients.map((ingredient, index) => (
                // A ruled line under every row
                <tr key={index} className="border-b border-line">
                  <td className="py-2">{ingredient.name}</td>
                  <td className="whitespace-nowrap px-2 py-2 text-right font-mono font-bold">
                    {formatAmount(ingredient, unitSystem)}
                  </td>
                  {percentages.length > 0 && (
                    <td className="py-2 text-right font-mono text-muted">
                      {percentFor(ingredient)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Hydration only means something for bread doughs, so it is
              hidden for everything else (see showsHydration). */}
          {showsHydration(recipe) && (
            <p className="mt-3 font-mono text-sm">
              hydration{" "}
              <span className="highlight font-bold">{recipeHydration}%</span>
            </p>
          )}
          {percentages.length > 0 && (
            <p className="mt-2 text-sm text-muted">
              Baker’s % is each ingredient’s weight compared with the flour.
            </p>
          )}
          {/* Only shown for cups or millilitres */}
          {unitSystem !== "grams" && (
            <p className="mt-2 text-sm text-muted">
              Volumes are approximate: a cup of flour changes with how it is
              scooped. Weigh in grams when it matters.
              {/* some() is true if at least one item passes the test */}
              {shown.ingredients.some(
                (ingredient) =>
                  ingredient.unit === "g" && !hasVolume(ingredient)
              ) && " Ingredients without a known density stay in grams."}
            </p>
          )}
          {isScaled && (
            <p className="mt-2 text-sm text-muted">
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
          <h2 className="mb-4 font-mono text-xl font-bold">
            <span className="highlight">Method</span>
          </h2>
          <ol>
            {recipe.instructions.map((step, index) => (
              // A dashed line between steps, but not after the last one
              <li
                key={index}
                className="flex gap-4 border-b border-dashed border-line py-3.5 first:pt-0 last:border-b-0"
              >
                {/* Step number as 01, 02...: padStart adds a leading zero
                    until the text is 2 characters long */}
                <span className="font-mono text-xl font-bold leading-7 text-muted">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="leading-7">{step}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </>
  );
}
