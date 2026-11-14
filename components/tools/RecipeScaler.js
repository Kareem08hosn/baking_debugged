"use client";

import { useState } from "react";
import { bakersPercentages, hydration, scaleRecipe } from "@/lib/scaler";

// The example the scaler opens with, so it shows what it does straight away.
// "id" lets React tell rows apart when one is removed.
const EXAMPLE_ROWS = [
  { id: "ex-1", name: "bread flour", amount: "500", unit: "g" },
  { id: "ex-2", name: "water", amount: "340", unit: "g" },
  { id: "ex-3", name: "salt", amount: "10", unit: "g" },
  { id: "ex-4", name: "instant yeast", amount: "7", unit: "g" },
];

// The columns of one ingredient row. Phones: amount, unit, result, remove
// (the name sits on its own line above, spanning the first four). From
// "sm" up: name, amount, unit, result, remove on one line.
const ROW_GRID =
  "grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_2.25rem] gap-x-2 gap-y-2 sm:grid-cols-[minmax(0,1fr)_5.5rem_5.5rem_5.5rem_2.25rem]";

// A new id for each added row. crypto.randomUUID() is built into browsers
// and gives a random text id that won't repeat.
function newRow() {
  return { id: crypto.randomUUID(), name: "", amount: "", unit: "g" };
}

// Scale any recipe: type the ingredients, say how many it makes and how
// many you want. Uses scaleRecipe from lib/scaler.js, like the recipe pages.
export default function RecipeScaler() {
  const [rows, setRows] = useState(EXAMPLE_ROWS);
  const [isExample, setIsExample] = useState(true);
  const [makesText, setMakesText] = useState("1");
  const [wantText, setWantText] = useState("2");

  // Changes one field of one row. map() builds a new list where only the
  // matching row is replaced by a copy with that field changed.
  function updateRow(id, field, value) {
    setRows(rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
    setIsExample(false);
  }

  function removeRow(id) {
    setRows(rows.filter((row) => row.id !== id));
    setIsExample(false);
  }

  function addRow() {
    setRows([...rows, newRow()]);
    setIsExample(false);
  }

  function clearAll() {
    setRows([newRow()]);
    setIsExample(false);
  }

  function loadExample() {
    setRows(EXAMPLE_ROWS);
    setMakesText("1");
    setWantText("2");
    setIsExample(true);
  }

  const makes = Number(makesText);
  const want = Number(wantText);
  const canScale = makes > 0 && want > 0;

  // Turn the rows into the recipe shape lib/scaler.js expects, keeping only
  // rows that have a name and an amount above zero.
  const ingredients = rows
    .filter((row) => row.name.trim() !== "" && Number(row.amount) > 0)
    .map((row) => ({ name: row.name.trim(), amount: Number(row.amount), unit: row.unit }));
  const recipe = { servings: canScale ? makes : 1, ingredients };
  const scaled = canScale ? scaleRecipe(recipe, want) : recipe;

  // Look up the scaled amount for a row, or "" if that row isn't usable.
  function scaledAmountFor(row) {
    const position = ingredients.findIndex(
      (ingredient) => ingredient.name === row.name.trim() && ingredient.amount === Number(row.amount)
    );
    if (position === -1) {
      return "";
    }
    const ingredient = scaled.ingredients[position];
    return ingredient.unit === "g" ? `${ingredient.amount} g` : `${ingredient.amount}`;
  }

  const percentages = bakersPercentages(recipe);
  const recipeHydration = hydration(recipe);
  const factor = canScale ? Math.round((want / makes) * 100) / 100 : null;

  return (
    <div className="note tape px-4 pb-5 pt-7 sm:px-5">
      {/* The two numbers that set the scale, and the factor between them */}
      <div className="graph flex flex-wrap items-end gap-x-4 gap-y-3 border-[1.5px] border-foreground p-3.5">
        <label className="label">
          Recipe makes
          <input
            id="scaler-makes"
            className="field mt-1 w-24 text-center font-mono text-lg font-bold"
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={makesText}
            onChange={(event) => setMakesText(event.target.value)}
          />
        </label>
        <label className="label">
          You want
          <input
            id="scaler-want"
            className="field mt-1 w-24 text-center font-mono text-lg font-bold"
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={wantText}
            onChange={(event) => setWantText(event.target.value)}
          />
        </label>
        <p className="ml-auto font-mono" aria-live="polite">
          <span className="label block">Multiply by</span>
          <b className="text-3xl tabular-nums">{factor === null ? "–" : `× ${factor}`}</b>
        </p>
      </div>

      {isExample && (
        <p className="hand mt-4 -rotate-1 text-muted">
          example loaded: type over it, or clear it and add your own
        </p>
      )}

      {/* The ingredient rows. On phones each row takes two lines (the name,
          then amount / unit / result); from "sm" up it is one line, under a
          row of column names. ROW_GRID is shared so the columns line up. */}
      <div className={`${ROW_GRID} label mt-4 hidden border-b-[1.5px] border-foreground pb-1.5 sm:grid`} aria-hidden="true">
        <span>Ingredient</span>
        <span>Amount</span>
        <span>Unit</span>
        <span className="text-right">Scaled</span>
        <span />
      </div>
      <ul>
        {rows.map((row, index) => {
          const percent = percentages.find((item) => item.name === row.name.trim());
          const scaledText = scaledAmountFor(row);
          return (
            <li key={row.id} className={`${ROW_GRID} items-center border-b border-line py-2`}>
              <input
                className="field col-span-4 py-1.5 sm:col-span-1"
                aria-label={`Ingredient ${index + 1} name`}
                placeholder="e.g. butter"
                value={row.name}
                onChange={(event) => updateRow(row.id, "name", event.target.value)}
              />
              <input
                className="field py-1.5 font-mono"
                aria-label={`Ingredient ${index + 1} amount`}
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={row.amount}
                onChange={(event) => updateRow(row.id, "amount", event.target.value)}
              />
              <select
                className="field py-1.5 font-mono"
                aria-label={`Ingredient ${index + 1} unit`}
                value={row.unit}
                onChange={(event) => updateRow(row.id, "unit", event.target.value)}
              >
                <option value="g">g</option>
                <option value="count">whole</option>
              </select>
              {/* The result, with the baker's % under it when there's flour */}
              <p className="text-right font-mono leading-tight">
                {scaledText && (
                  <>
                    <span className="sr-only">Scaled: </span>
                    <b className="whitespace-nowrap tabular-nums">{scaledText}</b>
                  </>
                )}
                {percent && (
                  <span className="block text-xs text-muted tabular-nums">{percent.percent}%</span>
                )}
              </p>
              <button
                type="button"
                className="grid size-9 place-content-center justify-self-end rounded-full hover:bg-background"
                aria-label={`Remove ${row.name.trim() || `ingredient ${index + 1}`}`}
                onClick={() => removeRow(row.id)}
              >
                <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                  <path d="M5 5 L15 15 M15 5 L5 15" />
                </svg>
              </button>
            </li>
          );
        })}
      </ul>
      {percentages.length > 0 && (
        <p className="mt-2 text-xs text-muted">
          The small % under each result is its baker’s percentage.
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-sm">
        <button type="button" className="btn-quiet" onClick={addRow}>
          + Add ingredient
        </button>
        <button type="button" className="underline underline-offset-4" onClick={clearAll}>
          Clear all
        </button>
        {!isExample && (
          <button type="button" className="underline underline-offset-4" onClick={loadExample}>
            Load the example
          </button>
        )}
      </div>

      {recipeHydration > 0 && (
        <p className="mt-4 font-mono text-sm">
          hydration <b className="highlight">{recipeHydration}%</b>
          <span className="text-muted"> (the same at any size)</span>
        </p>
      )}
      <p className="mt-2 text-sm text-muted">
        Grams round to 1 g (0.1 g under 10 g); whole items like eggs round to
        the nearest half.
      </p>
    </div>
  );
}
