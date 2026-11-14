"use client";

import { useState } from "react";
import Link from "next/link";
import HandArrow from "@/components/HandArrow";
import { hydration, scaleRecipe, showsHydration } from "@/lib/scaler";
import { formatAmount } from "@/lib/units";

const MIN_SERVINGS = 1;
const MAX_SERVINGS = 99;

// A small working scaler on the homepage, using one real recipe and the
// same functions as the recipe pages (lib/scaler.js and lib/units.js).
export default function ScalerDemo({ recipe }) {
  const [servings, setServings] = useState(recipe.servings);
  // "grams" or "us" (cups and spoons): the ids lib/units.js understands
  const [unitSystem, setUnitSystem] = useState("grams");
  // Has the visitor changed anything yet? The amounts only flash after a
  // change, not when the page first loads.
  const [hasChanged, setHasChanged] = useState(false);

  // Worked out again on every redraw from the two pieces of state above.
  const scaled = scaleRecipe(recipe, servings);

  function changeServings(newServings) {
    setServings(newServings);
    setHasChanged(true);
  }

  function changeUnits(newUnitSystem) {
    setUnitSystem(newUnitSystem);
    setHasChanged(true);
  }

  return (
    <section className="page grid gap-8 pb-18 md:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] md:items-center md:gap-14">
      <div>
        <h2 className="section-title">
          <span className="highlight">Scale it before you bake it</span>
        </h2>
        <p className="mt-4 max-w-md">
          Every recipe resizes to the servings or the pan you have, and
          converts to cups if you don’t own a scale yet.
        </p>
        <p className="hand mt-5 flex -rotate-2 items-end gap-1">
          change the servings
          <HandArrow shape="upRight" />
        </p>
        <Link href="/tools" className="link mt-4 inline-block">
          Open the lab tools
        </Link>
      </div>

      <div className="note note-ruled tape px-4.5 pb-4 pt-7.5">
        <h3 className="font-mono text-xl font-bold leading-7 tracking-tight">
          <Link href={`/recipes/${recipe.id}`} className="hover:underline">
            {recipe.name}
          </Link>
        </h3>

        <div className="my-3 flex flex-wrap items-center gap-x-5 gap-y-2.5 font-mono text-[0.8125rem]">
          <span className="flex items-center gap-1.5">
            <button
              type="button"
              className="btn-round"
              aria-label="Fewer servings"
              disabled={servings <= MIN_SERVINGS}
              onClick={() => changeServings(servings - 1)}
            >
              −
            </button>
            {/* <output> is the HTML element for a calculated result.
                aria-live makes screen readers say the new number. */}
            <output
              className="min-w-[2.4ch] text-center text-[1.35rem] font-bold tabular-nums"
              aria-live="polite"
            >
              {servings}
            </output>
            <button
              type="button"
              className="btn-round"
              aria-label="More servings"
              disabled={servings >= MAX_SERVINGS}
              onClick={() => changeServings(servings + 1)}
            >
              +
            </button>
            <span>servings</span>
          </span>

          <span role="group" aria-label="Units" className="flex gap-1.5">
            <button
              type="button"
              className="chip"
              aria-pressed={unitSystem === "grams"}
              onClick={() => changeUnits("grams")}
            >
              grams
            </button>
            <button
              type="button"
              className="chip"
              aria-pressed={unitSystem === "us"}
              onClick={() => changeUnits("us")}
            >
              cups
            </button>
          </span>
        </div>

        <ul>
          {scaled.ingredients.map((ingredient) => {
            const amount = formatAmount(ingredient, unitSystem);
            return (
              <li key={ingredient.name} className="flex items-baseline gap-2 leading-7">
                <span>{ingredient.name}</span>
                <span className="leader" aria-hidden="true" />
                {/* key={amount}: when the text changes, React swaps in a
                    brand-new element, which makes the flash animation
                    ("tick") play again. */}
                <b
                  key={amount}
                  className={`whitespace-nowrap font-mono text-[0.95rem] tabular-nums ${hasChanged ? "tick" : ""}`}
                >
                  {amount}
                </b>
              </li>
            );
          })}
        </ul>

        {showsHydration(recipe) && (
          <p className="hand mt-3.5 leading-7 text-muted">
            hydration {hydration(recipe)}%. ratios stay put at any size.
          </p>
        )}
      </div>
    </section>
  );
}
