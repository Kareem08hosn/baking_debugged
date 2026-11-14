"use client";

import { useState } from "react";
import { getPanById, pans } from "@/lib/pans";
import { panArea, panScaleFactor } from "@/lib/scaler";

// A pan picker: one of the common pans, or "custom" with your own size.
// "pan" is the current choice: { id, shape, diameter, length, width }.
function PanPicker({ idPrefix, legend, pan, onChange }) {
  function choose(id) {
    if (id === "custom") {
      onChange({ id: "custom", shape: "round", diameter: 20, length: 20, width: 20 });
    } else {
      onChange({ ...getPanById(id) });
    }
  }

  // Changes one size field. Number() turns the typed text into a number.
  function setField(field, value) {
    onChange({ ...pan, [field]: Number(value) });
  }

  return (
    <fieldset className="min-w-0">
      <legend className="label">{legend}</legend>
      <select
        id={`${idPrefix}-pan`}
        aria-label={legend}
        className="field mt-1.5 font-mono text-[0.9375rem]"
        value={pan.id}
        onChange={(event) => choose(event.target.value)}
      >
        {pans.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
        <option value="custom">Custom size…</option>
      </select>

      {pan.id === "custom" && (
        <div className="mt-2 flex flex-wrap items-end gap-2 font-mono text-sm">
          <label className="label">
            Shape
            <select
              className="field mt-1 w-auto py-1.5"
              value={pan.shape}
              onChange={(event) => onChange({ ...pan, shape: event.target.value })}
            >
              <option value="round">round</option>
              <option value="rectangle">rectangle</option>
            </select>
          </label>
          {pan.shape === "round" ? (
            <label className="label">
              Diameter (cm)
              <input className="field mt-1 w-24 py-1.5" type="number" min="1" step="any" inputMode="decimal" value={pan.diameter} onChange={(event) => setField("diameter", event.target.value)} />
            </label>
          ) : (
            <>
              <label className="label">
                Length (cm)
                <input className="field mt-1 w-24 py-1.5" type="number" min="1" step="any" inputMode="decimal" value={pan.length} onChange={(event) => setField("length", event.target.value)} />
              </label>
              <label className="label">
                Width (cm)
                <input className="field mt-1 w-24 py-1.5" type="number" min="1" step="any" inputMode="decimal" value={pan.width} onChange={(event) => setField("width", event.target.value)} />
              </label>
            </>
          )}
        </div>
      )}
    </fieldset>
  );
}

// The pan's width and height in cm, for drawing it.
function panSize(pan) {
  return pan.shape === "round"
    ? { w: pan.diameter, h: pan.diameter }
    : { w: pan.length, h: pan.width };
}

// Both pans drawn to the same scale, one on top of the other.
function PanSketch({ from, to }) {
  const a = panSize(from);
  const b = panSize(to);
  const BOX = 200;
  // The largest side of either pan fills the box; everything else scales.
  const scale = (BOX - 16) / Math.max(a.w, a.h, b.w, b.h);

  function shape(pan, size, props) {
    const w = size.w * scale;
    const h = size.h * scale;
    return pan.shape === "round" ? (
      <ellipse cx={BOX / 2} cy={BOX / 2} rx={w / 2} ry={h / 2} {...props} />
    ) : (
      <rect x={(BOX - w) / 2} y={(BOX - h) / 2} width={w} height={h} rx="4" {...props} />
    );
  }

  return (
    <svg viewBox={`0 0 ${BOX} ${BOX}`} className="mx-auto block h-auto w-full max-w-56" aria-hidden="true">
      {shape(to, b, { fill: "var(--highlight)", stroke: "currentColor", strokeWidth: 2.4 })}
      {shape(from, a, { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeDasharray: "5 5" })}
    </svg>
  );
}

// True if the pan has sensible sizes (custom boxes may be empty or 0).
function isUsable(pan) {
  const size = panSize(pan);
  return size.w > 0 && size.h > 0;
}

// Converts a recipe from one pan to another by comparing base areas, so the
// batter sits at the same depth (panScaleFactor in lib/scaler.js).
export default function PanConverter() {
  const [from, setFrom] = useState({ ...getPanById("round-20") });
  const [to, setTo] = useState({ ...getPanById("rect-33x23") });

  const usable = isUsable(from) && isUsable(to);
  const factor = usable ? panScaleFactor(from, to) : null;

  return (
    <div className="note tape px-4 pb-5 pt-7 sm:px-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <PanPicker idPrefix="from" legend="Recipe’s pan" pan={from} onChange={setFrom} />
        <PanPicker idPrefix="to" legend="Your pan" pan={to} onChange={setTo} />
      </div>

      <div className="graph mt-5 grid items-center gap-4 border-[1.5px] border-foreground p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {usable && <PanSketch from={from} to={to} />}
        <div aria-live="polite">
          <p className="label">Multiply every ingredient by</p>
          <p className="font-mono text-5xl font-extrabold tracking-tight tabular-nums">
            {factor === null ? "–" : `× ${Math.round(factor * 100) / 100}`}
          </p>
          {usable && (
            <p className="mt-2 font-mono text-sm tabular-nums">
              {Math.round(panArea(from))} cm² → {Math.round(panArea(to))} cm²
            </p>
          )}
          <p className="hand mt-2 text-muted">dashed = recipe’s pan, filled = yours</p>
        </div>
      </div>

      <p className="mt-4 text-sm text-muted">
        This keeps the batter at the same depth, so bake time stays roughly
        the same. Start checking 5 to 10 minutes early anyway: pans differ in
        material and colour.
      </p>
    </div>
  );
}
