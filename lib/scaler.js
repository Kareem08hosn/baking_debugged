// Recipe maths: scaling, baker's percentages and hydration.
//
// This is a JavaScript port of python/scaler.py. The two files follow the
// same rules on purpose, so the website and the Python analysis always agree.
// If you change a rule here, change it there too (and in both test files).
//
// Every function takes plain recipe objects and returns new values without
// changing what it was given. Nothing here touches React or the page, which
// is what makes it easy to test (see lib/scaler.test.js).

// How much of an ingredient's weight is water, as a fraction from 0 to 1.
// Hydration counts the water in these. Ingredients that aren't listed count
// as 0, including butter (about 16% water), which bakers leave out by
// convention.
const WATER_FRACTION = {
  water: 1.0,
  milk: 0.87,
  buttermilk: 0.9,
  yogurt: 0.85,
};

// A sourdough starter is flour and water mixed together. This assumes a
// "100% hydration" starter: equal weights of each, the most common kind.
const STARTER_FLOUR_FRACTION = 0.5;
const STARTER_WATER_FRACTION = 0.5;

// Rounds an amount to something you can measure. Grams round to the nearest
// gram (or 0.1 g below 10 g, where a whole gram is a big difference, e.g.
// salt). Counts round to the nearest half: half an egg is doable.
export function roundAmount(amount, unit) {
  if (unit === "count") {
    return Math.round(amount * 2) / 2;
  }
  if (amount < 10) {
    return Math.round(amount * 10) / 10;
  }
  return Math.round(amount);
}

// Returns a copy of the recipe with every amount scaled to newServings.
// Bake time is NOT scaled: it depends on the size and shape of what goes in
// the oven, not on the total amount.
export function scaleRecipe(recipe, newServings) {
  if (!(newServings > 0)) {
    // "throw" stops the function with an error, like Java's throw.
    throw new Error("servings must be more than 0");
  }

  const factor = newServings / recipe.servings;

  return {
    ...recipe,
    servings: newServings,
    ingredients: recipe.ingredients.map((ingredient) => ({
      ...ingredient,
      amount: roundAmount(ingredient.amount * factor, ingredient.unit),
    })),
  };
}

// The area of a pan's base in square centimetres.
// Round: pi x radius squared. Rectangle (and square, and loaf tin): length x width.
export function panArea(pan) {
  if (pan.shape === "round") {
    const radius = pan.diameter / 2;
    return Math.PI * radius * radius;
  }
  return pan.length * pan.width;
}

// How much to multiply a recipe by when moving it from one pan to another,
// so the batter sits at the same depth: the ratio of the two base areas.
// 20 cm round -> 33 x 23 cm rectangle is about 2.4, so it needs 2.4x of
// everything.
export function panScaleFactor(fromPan, toPan) {
  return panArea(toPan) / panArea(fromPan);
}

// True for any flour: "flour", "bread flour", "whole wheat flour"...
function isFlour(ingredient) {
  return ingredient.name.toLowerCase().includes("flour");
}

function isStarter(ingredient) {
  return ingredient.name.toLowerCase().includes("starter");
}

// Rounds to one decimal place: 77.27 -> 77.3
function roundToOneDecimal(number) {
  return Math.round(number * 10) / 10;
}

// Each ingredient's weight as a percentage of the flour weight.
//
// This is how bakers write formulas: flour is always 100%, and everything
// else is measured against it. Water at 75% means 75 g of water for every
// 100 g of flour.
//
// Returns a list of { name, percent }. Ingredients measured by count (eggs)
// have no weight in the data, so they are left out. Returns an empty list if
// the recipe has no flour.
export function bakersPercentages(recipe) {
  const weighed = recipe.ingredients.filter(
    (ingredient) => ingredient.unit === "g"
  );

  // reduce() boils a list down to one value. Here it adds up the amounts:
  // "total" starts at 0 and each flour's amount is added to it in turn.
  const flour = weighed
    .filter(isFlour)
    .reduce((total, ingredient) => total + ingredient.amount, 0);

  if (flour === 0) {
    return [];
  }

  return weighed.map((ingredient) => ({
    name: ingredient.name,
    percent: roundToOneDecimal((ingredient.amount / flour) * 100),
  }));
}

// Water as a percentage of flour: the main number for bread dough.
// Higher means a wetter dough: roughly 60% is a stiff sandwich loaf and 75%
// or more gives an open, holey crumb.
//
// Counted: water and milk (by how much of each is water), and sourdough
// starter, split into its flour and its water.
// Not counted: eggs (measured by count, so no weight) and butter.
//
// Returns null if the recipe has no flour.
export function hydration(recipe) {
  let flour = 0;
  let water = 0;

  // for...of loops over a list, like Java's for (x : list)
  for (const ingredient of recipe.ingredients) {
    if (ingredient.unit !== "g") {
      continue;
    }

    if (isStarter(ingredient)) {
      flour += ingredient.amount * STARTER_FLOUR_FRACTION;
      water += ingredient.amount * STARTER_WATER_FRACTION;
    } else if (isFlour(ingredient)) {
      flour += ingredient.amount;
    } else {
      // ?? 0 means "use 0 if this ingredient isn't in the table"
      const waterFraction = WATER_FRACTION[ingredient.name.toLowerCase()] ?? 0;
      water += ingredient.amount * waterFraction;
    }
  }

  if (flour === 0) {
    return null;
  }
  return roundToOneDecimal((water / flour) * 100);
}

// Whether hydration is a meaningful number to show for this recipe.
//
// Hydration describes bread dough, so it only makes sense for recipes raised
// with yeast or a sourdough starter. Doughs with eggs are left out too: eggs
// are mostly water, but they are measured by count, so the number would come
// out misleadingly low (brioche would show about 12%).
export function showsHydration(recipe) {
  const names = recipe.ingredients.map((ingredient) =>
    ingredient.name.toLowerCase()
  );
  const isRaisedDough = names.some(
    (name) => name.includes("yeast") || name.includes("starter")
  );
  const hasEggs = names.some((name) => name.includes("egg"));
  return isRaisedDough && !hasEggs && hydration(recipe) > 0;
}
