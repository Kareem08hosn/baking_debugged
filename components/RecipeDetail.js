// A client component, because the servings, units and pan controls react
// to the user.
"use client";

import { useState } from "react";
import RatingStamp from "@/components/RatingStamp";
import HydrationGauge from "@/components/recipe/HydrationGauge";
import MethodSteps from "@/components/recipe/MethodSteps";
import RecipeJournal from "@/components/recipe/RecipeJournal";
import SaveButton from "@/components/recipe/SaveButton";
import Link from "next/link";
import { topicsForRecipe } from "@/lib/chemistry/topics";
import { getPanById, pans } from "@/lib/pans";
import { usePreferences } from "@/lib/preferences";
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
    <div className="bg-surface px-4 py-3">
      {/* <dt> is the term and <dd> its value, inside the <dl> list below */}
      <dt className="label">{label}</dt>
      <dd className="font-mono text-xl font-bold tabular-nums">{value}</dd>
    </div>
  );
}

// Shows one full recipe, with controls that rescale the ingredients.
// It is shared by the built-in recipes and the ones saved in the browser.
// canSave is false for recipes saved only in this browser: they aren't in
// the database, so they can't be saved, logged as bakes or given notes.
export default function RecipeDetail({ recipe, canSave = true }) {
  // What is in the servings box. Inputs always hold text, so this is text
  // ("12"), and it starts as the recipe's own servings.
  const [servingsText, setServingsText] = useState(String(recipe.servings));

  // The pan the recipe was written for, or undefined if it has none (cookies,
  // a free-form loaf, or a recipe saved before pans existed).
  const originalPan = getPanById(recipe.pan);
  // The pan picked in the dropdown. "" means none is picked, which happens
  // when the servings were typed by hand and no longer match any pan.
  const [panId, setPanId] = useState(originalPan ? originalPan.id : "");

  // Which units the Amount column shows: "grams", "us" or "ml".
  // null means "not chosen on this page", so the person's saved preference
  // (lib/preferences.js, "grams" when signed out) is used.
  const [chosenUnits, setUnitSystem] = useState(null);
  const preferences = usePreferences();
  const unitSystem = chosenUnits ?? preferences.unitSystem;

  // While the box is empty or holds something unusable ("", "0", "-3"), keep
  // showing the original recipe instead of an error.
  const servings = Number(servingsText);
  const isValid = servings > 0;
  const shown = isValid ? scaleRecipe(recipe, servings) : recipe;
  const isScaled = shown.servings !== recipe.servings;

  // Baker's percentages are ratios, so they are the same at any size. They
  // are worked out from the original amounts to avoid rounding drift.
  const percentages = bakersPercentages(recipe);
  const hasFlour = percentages.length > 0;

  // Sets a new number of servings. That no longer matches a pan, unless it
  // is the original amount.
  function setServings(text) {
    setServingsText(text);
    const isOriginal = Number(text) === recipe.servings;
    setPanId(isOriginal && originalPan ? originalPan.id : "");
  }

  // The − and + buttons move to the next whole number: 13.9 -> 13 or 14.
  function stepServings(direction) {
    const current = isValid ? servings : recipe.servings;
    const next =
      direction > 0 ? Math.floor(current) + 1 : Math.ceil(current) - 1;
    setServings(String(Math.max(1, next)));
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

  const isUntested = recipe.tested === false;
  // The chemistry notes that fit this recipe (lib/chemistry/topics.js)
  const chemistry = topicsForRecipe(recipe);

  return (
    // <>...</> is a Fragment: it groups elements without adding an extra <div>
    <>
      {/* ---------- Title, stamp, source, save ---------- */}
      <div className="mt-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="label">
            No. {String(recipe.id).padStart(2, "0")} · {recipe.category} ·{" "}
            {recipe.difficulty}
            {/* Only show the diets if the recipe has any */}
            {recipe.diet.length > 0 && ` · ${recipe.diet.join(", ")}`}
          </p>
          <h1 className="mt-2 font-mono text-[clamp(2.1rem,8vw,3.75rem)] font-extrabold leading-[1.02] tracking-[-0.045em] [text-wrap:balance]">
            <span className="highlight">{recipe.name}</span>
          </h1>
        </div>
        {/* flex-none stops the stamp being squashed by a long title;
            scale-125 makes it a size bigger than on the cards */}
        <RatingStamp
          rating={recipe.rating}
          tested={recipe.tested}
          className="mr-2 mt-3 flex-none scale-125"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3">
        {/* Where the recipe was adapted from. The round stamp above
            already says UNTESTED; this line says what that means. */}
        {recipe.source && (
          <p className="text-sm text-muted">
            Adapted from{" "}
            <a
              href={recipe.source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-2"
            >
              {recipe.source.name}
              {/* Screen readers are told the link opens a new tab */}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            {recipe.rating != null && isUntested &&
              `, rated ${recipe.rating}/5 there`}
            .{isUntested && " Not test-baked here yet."}
          </p>
        )}
        {canSave && <SaveButton recipeId={recipe.id} />}
      </div>

      {/* ---------- Key numbers ----------
          2 per row on phones, 4 from "sm". The lines between the cells are
          a trick: the grid's own background is the line colour, each cell is
          paper-coloured, and gap-px leaves a 1px gap between cells for the
          background to show through. */}
      <dl className="note mt-7 grid grid-cols-2 gap-px bg-line sm:grid-cols-4">
        <Stat label="Serves" value={shown.servings} />
        <Stat label="Prep" value={`${recipe.prepTime} min`} />
        <Stat
          label="Bake"
          value={recipe.bakeTime > 0 ? `${recipe.bakeTime} min` : "none"}
        />
        <Stat label="Total" value={`${recipe.prepTime + recipe.bakeTime} min`} />
      </dl>

      {/* On phones the two sections stack, ingredients first. From "md" up
          they sit side by side: ingredients take 2 of 5 columns, the method
          takes 3. */}
      <div className="mt-12 grid gap-12 md:grid-cols-5 md:gap-10">
        {/* min-w-0 lets the column shrink below the width of its widest
            child (the pan dropdown), so narrow phones don't scroll sideways */}
        <section
          aria-labelledby="ingredients-heading"
          className="note tape min-w-0 self-start px-4 pb-5 pt-7 md:col-span-2"
        >
          <h2 id="ingredients-heading" className="font-mono text-2xl font-extrabold tracking-tight">
            Ingredients
          </h2>

          {/* ---------- The instrument panel: servings, units, pan ---------- */}
          <div className="graph mt-4 grid gap-4 border-[1.5px] border-foreground p-3.5">
            <div>
              <label htmlFor="servings" className="label block">
                Servings
              </label>
              <div className="mt-1.5 flex items-center gap-2">
                <button
                  type="button"
                  className="btn-round"
                  aria-label="Fewer servings"
                  disabled={isValid && servings <= 1}
                  onClick={() => stepServings(-1)}
                >
                  −
                </button>
                <input
                  id="servings"
                  className="field w-24 text-center font-mono text-xl font-bold tabular-nums"
                  type="number"
                  min="1"
                  step="any"
                  // Shows a number keypad with a decimal point on phones
                  inputMode="decimal"
                  value={servingsText}
                  onChange={(event) => setServings(event.target.value)}
                />
                <button
                  type="button"
                  className="btn-round"
                  aria-label="More servings"
                  onClick={() => stepServings(1)}
                >
                  +
                </button>
              </div>
            </div>

            {/* A fieldset groups related controls; its legend names the
                group, so screen readers say "Units, Grams, selected". */}
            <fieldset>
              <legend className="label">Units</legend>
              <div className="segmented mt-1.5">
                {UNIT_SYSTEMS.map((system) => (
                  <label key={system.id}>
                    <input
                      type="radio"
                      name="units"
                      value={system.id}
                      checked={unitSystem === system.id}
                      onChange={() => setUnitSystem(system.id)}
                    />
                    <span>{system.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Only recipes that are baked in a pan can be scaled to another */}
            {originalPan && (
              <div>
                <label htmlFor="pan" className="label block">
                  Pan
                </label>
                <select
                  id="pan"
                  className="field mt-1.5 font-mono text-[0.9375rem]"
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
              </div>
            )}

            {/* Only offer Reset once something has been changed */}
            {servingsText !== String(recipe.servings) && (
              <button
                type="button"
                className="justify-self-start font-mono text-sm underline underline-offset-4"
                onClick={handleReset}
              >
                Reset to {recipe.servings} servings
              </button>
            )}
          </div>

          {/* A real <table>, so screen readers can read it as rows and columns */}
          <table className="mt-5 w-full">
            <thead>
              <tr className="border-b-[1.5px] border-foreground">
                <th scope="col" className="label py-1.5 text-left font-normal">
                  Ingredient
                </th>
                <th scope="col" className="label px-2 py-1.5 text-right font-normal">
                  Amount
                </th>
                {/* The baker's % column only exists if the recipe has flour */}
                {hasFlour && (
                  <th scope="col" className="label py-1.5 text-right font-normal">
                    Baker’s %
                  </th>
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
                  <td className="py-2 pr-1">{ingredient.name}</td>
                  <td className="whitespace-nowrap px-2 py-2 text-right font-mono font-bold tabular-nums">
                    {formatAmount(ingredient, unitSystem)}
                  </td>
                  {hasFlour && (
                    <td className="py-2 text-right font-mono text-sm text-muted tabular-nums">
                      {percentFor(ingredient)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Hydration only means something for bread doughs, so it is
              hidden for everything else (see showsHydration). */}
          {showsHydration(recipe) && <HydrationGauge value={hydration(recipe)} />}

          {/* Notes about the numbers, only when they apply */}
          <div className="mt-4 grid gap-2 text-sm text-muted">
            {hasFlour && (
              <p>Baker’s % is each ingredient’s weight compared with the flour.</p>
            )}
            {unitSystem !== "grams" && (
              <p>
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
              <p>
                Scaled from {recipe.servings} servings. Bake time and any
                amounts written in the steps are for the original size.
                {/* Extra warning when the pan itself changed */}
                {originalPan &&
                  panId !== "" &&
                  panId !== originalPan.id &&
                  " The batter sits at the same depth in the new pan, but check it early: bake time changes with the pan."}
              </p>
            )}
          </div>
        </section>

        {/* ---------- Method ---------- */}
        <section aria-labelledby="method-heading" className="min-w-0 md:col-span-3">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
            <h2 id="method-heading" className="section-title">
              <span className="highlight">Method</span>
            </h2>
            <p className="hand -rotate-2 text-muted">tap a step to tick it off</p>
          </div>
          <div className="mt-4">
            <MethodSteps steps={recipe.instructions} />
          </div>

          {/* Links to the chemistry notes this recipe shows best */}
          {chemistry.length > 0 && (
            <aside className="graph sheet mt-12 px-5 pb-5 pt-7">
              <h2 className="font-mono text-lg font-bold">The chemistry in this one</h2>
              <ul className="mt-2">
                {chemistry.map((topic) => (
                  <li key={topic.slug} className="border-b border-dashed border-line last:border-b-0">
                    <Link href={`/chemistry/${topic.slug}`} className="group block py-2.5">
                      <span className="font-mono font-bold group-hover:underline">{topic.title}</span>
                      <span className="block text-sm text-muted">{topic.short}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </section>
      </div>

      {canSave && <RecipeJournal recipe={recipe} />}
    </>
  );
}
