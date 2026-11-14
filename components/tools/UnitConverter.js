"use client";

import { useState } from "react";
import { roundAmount } from "@/lib/scaler";
import {
  GRAMS_PER_CUP,
  celsiusToFahrenheit,
  fahrenheitToCelsius,
  formatMl,
  formatUsVolume,
  gramsToMl,
  mlToGrams,
  toMl,
} from "@/lib/units";

// The ingredient list for the dropdown, from the density table, A to Z.
const INGREDIENTS = Object.keys(GRAMS_PER_CUP).toSorted();

const UNITS = [
  { id: "g", label: "grams" },
  { id: "cup", label: "cups" },
  { id: "tbsp", label: "tbsp" },
  { id: "tsp", label: "tsp" },
  { id: "ml", label: "ml" },
];

// One result line: a name, a dotted leader and the value.
function Reading({ label, value }) {
  return (
    <div className="flex items-baseline gap-2 leading-8">
      <dt>{label}</dt>
      <span className="leader" aria-hidden="true" />
      <dd className="font-mono text-lg font-bold tabular-nums">{value}</dd>
    </div>
  );
}

// Weight <-> volume for one ingredient, plus oven temperatures.
export default function UnitConverter() {
  const [ingredient, setIngredient] = useState("flour");
  const [amountText, setAmountText] = useState("1");
  const [unit, setUnit] = useState("cup");

  // Two linked temperature boxes: typing in one fills in the other.
  const [celsiusText, setCelsiusText] = useState("180");
  const [fahrenheitText, setFahrenheitText] = useState("356");

  const gramsPerCup = GRAMS_PER_CUP[ingredient];
  const amount = Number(amountText);
  const isValid = amountText !== "" && amount >= 0;

  // Work everything out from grams and millilitres.
  const grams = unit === "g" ? amount : mlToGrams(toMl(amount, unit), gramsPerCup);
  const ml = unit === "g" ? gramsToMl(amount, gramsPerCup) : toMl(amount, unit);

  function changeCelsius(text) {
    setCelsiusText(text);
    setFahrenheitText(text === "" ? "" : String(celsiusToFahrenheit(Number(text))));
  }

  function changeFahrenheit(text) {
    setFahrenheitText(text);
    setCelsiusText(text === "" ? "" : String(fahrenheitToCelsius(Number(text))));
  }

  return (
    <div className="grid gap-8">
      <div className="note tape px-4 pb-5 pt-7 sm:px-5">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <label className="label">
            Ingredient
            <select
              id="unit-ingredient"
              className="field mt-1 font-mono"
              value={ingredient}
              onChange={(event) => setIngredient(event.target.value)}
            >
              {INGREDIENTS.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label className="label">
            Amount
            <input
              id="unit-amount"
              className="field mt-1 font-mono text-lg font-bold"
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              value={amountText}
              onChange={(event) => setAmountText(event.target.value)}
            />
          </label>
          <label className="label">
            Unit
            <select
              id="unit-unit"
              className="field mt-1 font-mono"
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
            >
              {UNITS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <dl className="graph mt-5 border-[1.5px] border-foreground px-4 py-3" aria-live="polite">
          <Reading label="Weight" value={isValid ? `${roundAmount(grams, "g")} g` : "–"} />
          <Reading label="Cups & spoons" value={isValid ? formatUsVolume(ml) : "–"} />
          <Reading label="Millilitres" value={isValid ? formatMl(ml) : "–"} />
        </dl>
        <p className="mt-3 text-sm text-muted">
          Based on {gramsPerCup} g per US cup of {ingredient}. Volumes are
          approximate: a scooped cup of flour can weigh 20% more than a
          spooned one.
        </p>
      </div>

      <div className="note note-ruled px-4 pb-4 pt-5 sm:px-5">
        <h3 className="font-mono text-lg font-bold leading-7">Oven temperature</h3>
        <div className="mt-2 flex flex-wrap items-end gap-3">
          <label className="label">
            Celsius
            <input
              id="temp-c"
              className="field mt-1 w-28 font-mono text-lg font-bold"
              type="number"
              inputMode="numeric"
              value={celsiusText}
              onChange={(event) => changeCelsius(event.target.value)}
            />
          </label>
          <span className="pb-2.5 font-mono text-xl" aria-hidden="true">=</span>
          <label className="label">
            Fahrenheit
            <input
              id="temp-f"
              className="field mt-1 w-28 font-mono text-lg font-bold"
              type="number"
              inputMode="numeric"
              value={fahrenheitText}
              onChange={(event) => changeFahrenheit(event.target.value)}
            />
          </label>
        </div>
        <p className="mt-2 text-sm leading-7 text-muted">
          Fan oven? Set it about 15 to 20 °C lower.
        </p>
      </div>
    </div>
  );
}
