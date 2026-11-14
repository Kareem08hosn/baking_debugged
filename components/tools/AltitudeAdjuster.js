"use client";

import { useState } from "react";
import { adjust, bandFor, boilingPointC, feetToMeters, middle } from "@/lib/altitude";

const BAKE_TYPES = [
  { id: "cake", label: "Cakes and quick breads" },
  { id: "bread", label: "Yeasted bread" },
  { id: "cookies", label: "Cookies" },
];

// "12.5% less" / "6 to 12.5% more" from a range of percentages
function describe([low, high], noun = "") {
  const a = Math.abs(low);
  const b = Math.abs(high);
  const direction = (low || high) < 0 ? "less" : "more";
  if (a === 0 && b === 0) return "no change";
  const amount = a === b ? `${a}%` : a === 0 ? `up to ${b}%` : `${Math.min(a, b)} to ${Math.max(a, b)}%`;
  return `${amount} ${direction}${noun}`;
}

// "100 g → 88 g" (or a range) for a range of percentages
function example([low, high]) {
  const a = adjust(100, low);
  const b = adjust(100, high);
  return a === b ? `100 g → ${a} g` : `100 g → ${Math.min(a, b)}–${Math.max(a, b)} g`;
}

// One row of the adjustments list
function Row({ what, change, detail }) {
  return (
    <div className="grid gap-x-4 gap-y-0.5 border-b border-line py-2.5 last:border-b-0 sm:grid-cols-[9rem_minmax(0,1fr)_auto]">
      <dt className="font-mono font-bold">{what}</dt>
      <dd>{change}</dd>
      {detail && <dd className="font-mono text-sm tabular-nums text-muted sm:text-right">{detail}</dd>}
    </div>
  );
}

// Suggests recipe changes for baking at altitude (lib/altitude.js).
export default function AltitudeAdjuster() {
  const [altitudeText, setAltitudeText] = useState("1600");
  const [unit, setUnit] = useState("m");
  const [type, setType] = useState("cake");

  const altitude = Number(altitudeText);
  const meters = unit === "m" ? altitude : feetToMeters(altitude);
  const isValid = altitudeText !== "" && altitude >= 0 && altitude <= 30000;
  const band = isValid ? bandFor(meters) : null;

  return (
    <div className="note tape px-4 pb-5 pt-7 sm:px-5">
      <div className="graph grid gap-4 border-[1.5px] border-foreground p-3.5">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="altitude" className="label block">Your altitude</label>
            <input
              id="altitude"
              className="field mt-1 w-32 font-mono text-lg font-bold tabular-nums"
              type="number"
              min="0"
              inputMode="numeric"
              value={altitudeText}
              onChange={(event) => setAltitudeText(event.target.value)}
            />
          </div>
          <fieldset>
            <legend className="sr-only">Unit</legend>
            <div className="segmented">
              {[["m", "metres"], ["ft", "feet"]].map(([id, label]) => (
                <label key={id}>
                  <input type="radio" name="altitude-unit" checked={unit === id} onChange={() => setUnit(id)} />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
        <fieldset>
          <legend className="label">What are you baking?</legend>
          <div className="segmented mt-1.5">
            {BAKE_TYPES.map((item) => (
              <label key={item.id}>
                <input type="radio" name="altitude-type" checked={type === item.id} onChange={() => setType(item.id)} />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="mt-5" aria-live="polite">
        {!isValid && <p className="text-muted">Enter your altitude to see the adjustments.</p>}

        {isValid && (
          <p className="font-mono text-sm">
            Water boils at about <b className="tabular-nums">{boilingPointC(meters)} °C</b> here
            {unit === "ft" && ` (${Math.round(meters)} m)`}.
          </p>
        )}

        {isValid && !band && (
          <p className="mt-3">
            Below about 900 m (3,000 ft) most recipes work as written. No changes needed.
          </p>
        )}

        {band && (
          <>
            <p className="mt-3">
              For {band.label}, start in the middle of each range and adjust after your first bake.
            </p>
            <dl className="mt-3">
              {type === "cake" && (
                <>
                  <Row what="Baking powder or soda" change={describe(band.leavener)} detail={example(band.leavener)} />
                  <Row what="Sugar" change={describe(band.sugar)} detail={example(band.sugar)} />
                  <Row what="Liquid" change={describe(band.liquid)} detail={example(band.liquid)} />
                  <Row what="Oven" change={`${band.ovenC[0]} to ${band.ovenC[1]} °C hotter`} detail={`start +${middle(band.ovenC)} °C`} />
                  <Row what="Time" change="Check 5 to 8 minutes early: the hotter oven bakes faster." />
                </>
              )}
              {type === "bread" && (
                <>
                  <Row what="Yeast" change={describe(band.yeast)} detail={example(band.yeast)} />
                  <Row what="Rising" change="Dough rises faster. Go by size (doubled), not the clock, and watch for over-proofing." />
                  <Row what="Liquid" change={`${describe(band.liquid)}, or until the dough feels as it should. Flour dries out more up here.`} />
                  <Row what="Oven" change="Usually unchanged. Check doneness by internal temperature." />
                </>
              )}
              {type === "cookies" && (
                <>
                  <Row what="Baking powder or soda" change={describe(band.leavener)} detail={example(band.leavener)} />
                  <Row what="Sugar" change={describe(band.sugar)} detail={example(band.sugar)} />
                  <Row what="Flour" change="If they spread too much, add 1 to 2 tablespoons (8 to 15 g) per batch." />
                  <Row what="Oven" change={`${band.ovenC[0]} °C hotter, so the edges set before they spread.`} />
                </>
              )}
            </dl>
          </>
        )}
      </div>

      <p className="mt-4 text-sm text-muted">
        Based on standard high-altitude baking guidance. Every recipe and oven
        differs: change one thing, bake, and note the result.
      </p>
    </div>
  );
}
