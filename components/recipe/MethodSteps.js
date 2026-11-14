"use client";

import { useState } from "react";

// The numbered steps. Each one can be ticked off while baking; the ticks
// are only remembered while the page is open.
export default function MethodSteps({ steps }) {
  // A Set of the positions (0, 1, 2...) of the steps that are done.
  const [done, setDone] = useState(() => new Set());

  function toggle(index) {
    // State must be replaced, not changed in place, or React won't notice.
    // So: copy the Set, change the copy, store the copy.
    const next = new Set(done);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setDone(next);
  }

  return (
    <ol>
      {steps.map((step, index) => (
        <li key={index} className="border-b border-dashed border-line last:border-b-0">
          {/* The whole step is the label, so tapping anywhere ticks it.
              The real checkbox is hidden (sr-only) but still works with a
              keyboard and screen reader. "peer" lets the elements after it
              change style when it is checked (peer-checked:...). */}
          <label className="flex cursor-pointer gap-4 py-4">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={done.has(index)}
              onChange={() => toggle(index)}
            />
            {/* The step number in a circle. Once ticked it fills in. */}
            <span
              className="grid size-9 flex-none place-content-center rounded-full border-[1.5px] border-foreground font-mono text-sm font-bold tabular-nums transition-colors peer-checked:bg-foreground peer-checked:text-background peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-foreground"
              aria-hidden="true"
            >
              {done.has(index) ? "✓" : index + 1}
            </span>
            <span className="pt-1 leading-7 transition-colors peer-checked:text-muted">
              <span className="sr-only">Step {index + 1}: </span>
              {step}
            </span>
          </label>
        </li>
      ))}
    </ol>
  );
}
