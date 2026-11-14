// High-altitude adjustments. Higher up, air pressure is lower: gas bubbles
// grow faster (bakes over-rise and collapse), water boils at a lower
// temperature and evaporates faster (bakes dry out, sugar concentrates).
//
// The numbers follow the widely used table from US university extension
// services for cakes and quick breads (adjustments start around 900 m /
// 3,000 ft), turned from "tablespoons per cup" into percentages so they
// work on gram amounts: 1 tbsp per cup is about 6%, 1/8 tsp per tsp 12.5%.
// [REVIEW] all figures below; they are starting points, not rules.
//
// No React: tested in lib/altitude.test.js.

export const METERS_PER_FOOT = 0.3048;

export function feetToMeters(feet) {
  return feet * METERS_PER_FOOT;
}

// The altitude bands. Each range is [smallest, largest] change, in percent
// of the original amount (negative = use less), or degrees for the oven.
export const BANDS = [
  {
    id: "900",
    from: 900,
    label: "about 900 to 1,500 m (3,000 to 5,000 ft)",
    leavener: [-12.5, -12.5], // 1/8 tsp less per tsp
    sugar: [0, -6], // up to 1 tbsp less per cup
    liquid: [6, 12.5], // 1 to 2 tbsp more per cup
    ovenC: [8, 14], // 15 to 25 °F hotter
    yeast: [-15, -25],
  },
  {
    id: "1500",
    from: 1500,
    label: "about 1,500 to 2,100 m (5,000 to 7,000 ft)",
    leavener: [-12.5, -25], // 1/8 to 1/4 tsp less per tsp
    sugar: [0, -12.5], // up to 2 tbsp less per cup
    liquid: [12.5, 25], // 2 to 4 tbsp more per cup
    ovenC: [8, 14],
    yeast: [-25, -25],
  },
  {
    id: "2100",
    from: 2100,
    label: "about 2,100 m (7,000 ft) and up",
    leavener: [-25, -25], // 1/4 tsp less per tsp
    sugar: [-6, -19], // 1 to 3 tbsp less per cup
    liquid: [19, 25], // 3 to 4 tbsp more per cup
    ovenC: [8, 14],
    yeast: [-25, -33],
  },
];

// Which band an altitude (in metres) falls in, or null below ~900 m, where
// most recipes need no change.
export function bandFor(meters) {
  // findLast: the last band whose start is at or below this altitude
  return BANDS.findLast((band) => meters >= band.from) ?? null;
}

// Water boils about 1 °C lower for every 300 m of altitude (approximate).
export function boilingPointC(meters) {
  return Math.round((100 - Math.max(0, meters) / 300) * 10) / 10;
}

// A percentage change applied to an amount, rounded to a whole gram:
// adjust(200, -6) -> 188
export function adjust(grams, percent) {
  return Math.round(grams * (1 + percent / 100));
}

// The midpoint of a range, the suggested place to start: [6, 12.5] -> 9.3
export function middle([low, high]) {
  return Math.round(((low + high) / 2) * 10) / 10;
}
