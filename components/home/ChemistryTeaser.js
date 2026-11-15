import Link from "next/link";
import PenCross from "@/components/PenCross";

// A cross drawn with two pen strokes, for the "what goes wrong" list.
// The homepage's chemistry feature: one explainer, taped in on graph paper.
// A shorter, hand-picked version of chemistry note #01 (the full text is in
// lib/chemistry/content.js). If that note changes, check this still agrees.
export default function ChemistryTeaser() {
  return (
    <section className="page pb-18">
      <div className="graph sheet px-5 pb-7 pt-10 md:-rotate-[0.5deg] md:px-12 md:pb-10 md:pt-12">
        <div className="grid gap-7 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] md:items-center md:gap-10">
          <div>
            <p className="stamp-label mb-4">Chemistry note #01</p>
            <h2 className="section-title">Baking soda vs baking powder</h2>
            <p className="mt-4 max-w-xl">
              Both make carbon dioxide. Soda needs an acid from the recipe and
              starts working the moment it gets wet. Powder carries its own
              acid and fires a second time in the oven.
            </p>

            <h3 className="mt-6 font-mono font-bold">What goes wrong if…</h3>
            <ul className="mt-1 max-w-xl">
              <li className="mt-3 flex gap-2.5">
                <PenCross />
                <span>
                  <b>you swap them 1:1.</b> Soda is about three times
                  stronger. Replacing soda with powder takes roughly 3× as
                  much, and the bake browns less.
                </span>
              </li>
              <li className="mt-3 flex gap-2.5">
                <PenCross />
                <span>
                  <b>a soda batter sits on the counter.</b> The gas escapes
                  before the oven can set the crumb, so it bakes up dense.
                </span>
              </li>
            </ul>

            <Link href="/chemistry/leaveners" className="link mt-7 inline-block">
              Read the full note
            </Link>
          </div>

          <div>
            {/* A pen sketch: a bowl of batter with bubbles rising out of it.
                role="img" + aria-label give screen readers one description
                in place of the individual shapes. */}
            <svg
              viewBox="0 0 320 230"
              className="mx-auto block h-auto w-full max-w-88"
              role="img"
              aria-label="Sketch of a mixing bowl with carbon dioxide bubbles rising out of the batter."
            >
              <g
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* the bowl, its rim, and the wavy surface of the batter */}
                <path d="M40 120 C 44 190, 90 214, 160 214 C 230 214, 276 190, 280 120" />
                <path d="M30 120 C 80 114, 240 114, 290 121" />
                <path d="M58 150 C 80 142, 100 158, 124 150 S 170 142, 196 151 S 240 158, 262 149" />
                {/* the arrow from the note to a bubble */}
                <path d="M92 50 C 102 56, 112 62, 122 68" />
                <path d="M111 56 L123 69 L106 71" />
              </g>
              {/* bubbles: filled with the paper colour so lines behind them
                  don't show through */}
              <g fill="var(--surface)" stroke="currentColor" strokeWidth="2">
                <circle cx="104" cy="176" r="7" />
                <circle cx="150" cy="186" r="5" />
                <circle cx="196" cy="174" r="8" />
                <circle cx="128" cy="128" r="9" />
                <circle cx="176" cy="104" r="11" />
                <circle cx="140" cy="74" r="13" />
                <circle cx="188" cy="48" r="10" />
                <circle cx="222" cy="134" r="6" />
              </g>
              <g className="hand" fill="currentColor">
                <text x="212" y="42">CO₂</text>
                <text x="6" y="26">this lifts</text>
                <text x="6" y="46">the crumb</text>
              </g>
            </svg>
            <p className="hand mt-2 text-center text-[1.45rem]">
              soda + acid → CO₂ + water + a salt
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
