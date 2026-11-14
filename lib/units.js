// Weight <-> volume conversion, and turning amounts into display text.
//
// Recipes store weights in grams. A cup of flour and a cup of sugar weigh
// very different amounts, so converting to cups or millilitres needs each
// ingredient's density. Like lib/scaler.js, nothing here touches React, so
// it can be tested on its own (see lib/units.test.js).

// US kitchen measures in millilitres. 1 cup = 16 tablespoons = 48 teaspoons.
export const ML_PER_CUP = 236.588;
export const ML_PER_TBSP = ML_PER_CUP / 16;
export const ML_PER_TSP = ML_PER_CUP / 48;

// How many grams one US cup of each ingredient weighs.
//
// These are APPROXIMATE, typical baking-reference values. Real cups vary a
// lot, especially flour: a scooped cup can weigh 20% more than a spooned one.
// That is why the site stores grams and treats volumes as a convenience.
//
// Keys are lowercase. An ingredient matches a key if its name contains it,
// and the longest match wins ("brown sugar" beats "sugar").
export const GRAMS_PER_CUP = {
  // flours
  flour: 120,
  "bread flour": 120,
  "whole wheat flour": 113,
  "almond flour": 96,
  cornstarch: 112,
  cocoa: 84,
  oats: 89,
  // sugars
  sugar: 200,
  "brown sugar": 213,
  "icing sugar": 113,
  "powdered sugar": 113,
  honey: 336,
  "maple syrup": 312,
  // fats
  butter: 227,
  oil: 198,
  // liquids
  water: 237,
  milk: 244,
  cream: 232,
  yogurt: 227,
  // small amounts (these mostly show up as teaspoons)
  salt: 288,
  "baking soda": 288,
  "baking powder": 192,
  yeast: 144,
  // other
  "chocolate chips": 170,
  banana: 227, // mashed
  "sourdough starter": 240,
};

// Finds the grams-per-cup for an ingredient name, or null if it isn't in the
// table. "ripe bananas" matches "banana"; "bread flour" matches both "flour"
// and "bread flour", and the longer key wins.
export function findGramsPerCup(name) {
  const lowerName = name.toLowerCase();
  let bestKey = null;

  // Object.keys() gives the list of keys: ["flour", "bread flour", ...]
  for (const key of Object.keys(GRAMS_PER_CUP)) {
    const isLonger = bestKey === null || key.length > bestKey.length;
    if (lowerName.includes(key) && isLonger) {
      bestKey = key;
    }
  }

  return bestKey === null ? null : GRAMS_PER_CUP[bestKey];
}

// Weight -> volume. gramsPerCup is the ingredient's density from the table.
export function gramsToMl(grams, gramsPerCup) {
  return (grams / gramsPerCup) * ML_PER_CUP;
}

// Volume -> weight: the same sum the other way round.
export function mlToGrams(ml, gramsPerCup) {
  return (ml / ML_PER_CUP) * gramsPerCup;
}

// The fractions a set of measuring cups has, with how to write each one.
const CUP_FRACTIONS = [
  { value: 0, text: "" },
  { value: 1 / 4, text: "¼" },
  { value: 1 / 3, text: "⅓" },
  { value: 1 / 2, text: "½" },
  { value: 2 / 3, text: "⅔" },
  { value: 3 / 4, text: "¾" },
  { value: 1, text: "" }, // rounds up to the next whole cup
];

// Spoons come in quarters.
const SPOON_FRACTIONS = [
  { value: 0, text: "" },
  { value: 1 / 4, text: "¼" },
  { value: 1 / 2, text: "½" },
  { value: 3 / 4, text: "¾" },
  { value: 1, text: "" },
];

// Writes a number as a whole part plus the nearest fraction from the list:
// 2.3 with cup fractions -> "2 ⅓". Returns "" if it rounds to nothing.
function formatFraction(number, fractions) {
  let whole = Math.floor(number);
  const remainder = number - whole;

  // Find the fraction closest to the leftover part.
  let nearest = fractions[0];
  for (const fraction of fractions) {
    const isCloser =
      Math.abs(fraction.value - remainder) < Math.abs(nearest.value - remainder);
    if (isCloser) {
      nearest = fraction;
    }
  }

  if (nearest.value === 1) {
    whole += 1;
  }
  if (whole === 0) {
    return nearest.text;
  }
  // "2" or "2 ⅓"
  return nearest.text === "" ? `${whole}` : `${whole} ${nearest.text}`;
}

// Turns millilitres into the US measure a person would reach for:
// a quarter cup or more -> cups, a tablespoon or more -> tablespoons,
// anything smaller -> teaspoons.
export function formatUsVolume(ml) {
  const cups = ml / ML_PER_CUP;
  // 0.22 instead of 0.25 so that "almost a quarter cup" isn't shown as
  // 3 ½ tablespoons
  if (cups >= 0.22) {
    const text = formatFraction(cups, CUP_FRACTIONS);
    // Only exactly "1" is singular: "1 cup", but "1 ½ cups" and "¾ cup"
    const isSingular = cups <= 1.125;
    return `${text} ${isSingular ? "cup" : "cups"}`;
  }

  const tablespoons = ml / ML_PER_TBSP;
  if (tablespoons >= 0.875) {
    return `${formatFraction(tablespoons, SPOON_FRACTIONS)} tbsp`;
  }

  const teaspoons = ml / ML_PER_TSP;
  const text = formatFraction(teaspoons, SPOON_FRACTIONS);
  // Less than an eighth of a teaspoon rounds to nothing
  return text === "" ? "a pinch" : `${text} tsp`;
}

// Rounds millilitres to something a measuring jug can show.
function roundMl(ml) {
  if (ml < 10) {
    return Math.round(ml * 10) / 10;
  }
  return Math.round(ml);
}

// The unit systems the recipe page offers.
export const UNIT_SYSTEMS = [
  { id: "grams", label: "Grams" },
  { id: "us", label: "Cups and spoons" },
  { id: "ml", label: "Millilitres" },
];

// Turns an ingredient into the text shown in the Amount column.
//   grams:  { name: "flour", amount: 250, unit: "g" } -> "250 g"
//   us:                                               -> "2 cups"
//   ml:                                               -> "493 ml"
// Counts (eggs) are always just the number. An ingredient with no density
// in the table stays in grams whatever the unit system is.
export function formatAmount(ingredient, unitSystem = "grams") {
  if (ingredient.unit === "count") {
    return `${ingredient.amount}`;
  }

  const gramsPerCup = findGramsPerCup(ingredient.name);
  if (unitSystem === "grams" || gramsPerCup === null) {
    return `${ingredient.amount} ${ingredient.unit}`;
  }

  const ml = gramsToMl(ingredient.amount, gramsPerCup);
  if (unitSystem === "us") {
    return formatUsVolume(ml);
  }
  return `${roundMl(ml)} ml`;
}

// True if switching to a volume unit would change how this ingredient is
// shown. Used to tell the reader which ingredients stayed in grams.
export function hasVolume(ingredient) {
  return ingredient.unit === "g" && findGramsPerCup(ingredient.name) !== null;
}
