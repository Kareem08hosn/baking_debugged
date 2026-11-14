// Tests for lib/scaler.js. Run them with: npm test
//
// These mirror python/test_scaler.py case for case, with the same recipes
// and the same expected numbers. If both test files pass, the JavaScript and
// Python versions agree.
//
// node:test and node:assert are built into Node, so nothing is installed.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  bakersPercentages,
  hydration,
  panArea,
  panScaleFactor,
  scaleRecipe,
  showsHydration,
} from "./scaler.js";

// 500 g flour, 375 g water -> 75% hydration before the starter is counted.
const SOURDOUGH = {
  id: 1,
  name: "Test sourdough",
  servings: 12,
  ingredients: [
    { name: "bread flour", amount: 500, unit: "g" },
    { name: "water", amount: 375, unit: "g" },
    { name: "sourdough starter", amount: 100, unit: "g" },
    { name: "salt", amount: 10, unit: "g" },
  ],
};

const CAKE = {
  id: 2,
  name: "Test cake",
  servings: 10,
  ingredients: [
    { name: "flour", amount: 200, unit: "g" },
    { name: "butter", amount: 100, unit: "g" },
    { name: "eggs", amount: 3, unit: "count" },
    { name: "baking soda", amount: 5, unit: "g" },
  ],
};

const NO_FLOUR = {
  id: 3,
  name: "Test meringue",
  servings: 6,
  ingredients: [{ name: "sugar", amount: 200, unit: "g" }],
};

// { name: amount } for a recipe, to keep the assertions short.
function amounts(recipe) {
  return Object.fromEntries(
    recipe.ingredients.map((ingredient) => [ingredient.name, ingredient.amount])
  );
}

test("doubling doubles every amount", () => {
  const scaled = scaleRecipe(SOURDOUGH, 24);
  assert.equal(scaled.servings, 24);
  assert.deepEqual(amounts(scaled), {
    "bread flour": 1000,
    water: 750,
    "sourdough starter": 200,
    salt: 20,
  });
});

test("same servings changes nothing", () => {
  assert.deepEqual(amounts(scaleRecipe(CAKE, 10)), amounts(CAKE));
});

test("the original recipe is not changed", () => {
  scaleRecipe(SOURDOUGH, 24);
  assert.equal(SOURDOUGH.ingredients[0].amount, 500);
  assert.equal(SOURDOUGH.servings, 12);
});

test("counts round to the nearest half", () => {
  // 3 eggs for 10 servings -> 1.5 for 5 and 1.2 for 4 (rounds to 1)
  assert.equal(amounts(scaleRecipe(CAKE, 5)).eggs, 1.5);
  assert.equal(amounts(scaleRecipe(CAKE, 4)).eggs, 1);
});

test("small gram amounts keep one decimal", () => {
  // 5 g baking soda for 10 servings -> 1.5 g for 3
  assert.equal(amounts(scaleRecipe(CAKE, 3))["baking soda"], 1.5);
});

test("a half gram rounds up", () => {
  // 225 g for 10 servings -> 112.5 g for 5, which rounds up to 113
  const recipe = {
    servings: 10,
    ingredients: [{ name: "flour", amount: 225, unit: "g" }],
  };
  assert.equal(amounts(scaleRecipe(recipe, 5)).flour, 113);
});

test("ratios survive scaling", () => {
  assert.equal(hydration(scaleRecipe(SOURDOUGH, 36)), hydration(SOURDOUGH));
});

test("zero, negative or non-number servings is an error", () => {
  assert.throws(() => scaleRecipe(CAKE, 0));
  assert.throws(() => scaleRecipe(CAKE, -2));
  // NaN ("not a number") is what Number("abc") gives
  assert.throws(() => scaleRecipe(CAKE, NaN));
});

test("flour is 100% and the rest is relative to it", () => {
  assert.deepEqual(bakersPercentages(SOURDOUGH), [
    { name: "bread flour", percent: 100 },
    { name: "water", percent: 75 },
    { name: "sourdough starter", percent: 20 },
    { name: "salt", percent: 2 },
  ]);
});

test("count ingredients are left out of baker's percentages", () => {
  const names = bakersPercentages(CAKE).map((row) => row.name);
  assert.equal(names.includes("eggs"), false);
});

test("no flour gives an empty list of percentages", () => {
  assert.deepEqual(bakersPercentages(NO_FLOUR), []);
});

test("starter counts as half flour, half water", () => {
  // flour 500 + 50 = 550, water 375 + 50 = 425 -> 77.3%
  assert.equal(hydration(SOURDOUGH), 77.3);
});

test("plain water over flour", () => {
  const recipe = {
    servings: 1,
    ingredients: [
      { name: "flour", amount: 400, unit: "g" },
      { name: "water", amount: 260, unit: "g" },
    ],
  };
  assert.equal(hydration(recipe), 65);
});

test("milk counts for its water only", () => {
  const recipe = {
    servings: 1,
    ingredients: [
      { name: "flour", amount: 100, unit: "g" },
      { name: "milk", amount: 100, unit: "g" },
    ],
  };
  assert.equal(hydration(recipe), 87);
});

test("no liquid is zero hydration", () => {
  assert.equal(hydration(CAKE), 0);
});

test("no flour gives null hydration", () => {
  assert.equal(hydration(NO_FLOUR), null);
});

const ROUND_20 = { id: "round-20", shape: "round", diameter: 20 };
const SQUARE_20 = { id: "square-20", shape: "rectangle", length: 20, width: 20 };
const RECT_40X20 = { id: "rect", shape: "rectangle", length: 40, width: 20 };

test("a rectangle's area is length times width", () => {
  assert.equal(panArea(RECT_40X20), 800);
});

test("a round pan's area is pi times radius squared", () => {
  // radius 10 -> 314.159...; compare to 2 decimal places
  assert.equal(panArea(ROUND_20).toFixed(2), "314.16");
});

test("the same pan scales by 1", () => {
  assert.equal(panScaleFactor(ROUND_20, ROUND_20), 1);
});

test("a pan with double the area doubles the recipe", () => {
  assert.equal(panScaleFactor(SQUARE_20, RECT_40X20), 2);
});

test("going to a smaller pan gives a factor below 1", () => {
  assert.equal(panScaleFactor(RECT_40X20, SQUARE_20), 0.5);
});

test("a square holds more than a round pan of the same width", () => {
  // 400 / 314.16 = 1.27
  assert.equal(panScaleFactor(ROUND_20, SQUARE_20).toFixed(2), "1.27");
});

test("yogurt and buttermilk count for their water", () => {
  const recipe = {
    servings: 1,
    ingredients: [
      { name: "flour", amount: 100, unit: "g" },
      { name: "yogurt", amount: 100, unit: "g" },
    ],
  };
  assert.equal(hydration(recipe), 85);
});

test("hydration is shown for a yeast or sourdough dough", () => {
  assert.equal(showsHydration(SOURDOUGH), true);
});

test("hydration is not shown for a cake, or a dough with eggs", () => {
  assert.equal(showsHydration(CAKE), false);
  const brioche = {
    servings: 1,
    ingredients: [
      { name: "bread flour", amount: 300, unit: "g" },
      { name: "milk", amount: 40, unit: "g" },
      { name: "eggs", amount: 3, unit: "count" },
      { name: "instant yeast", amount: 6, unit: "g" },
    ],
  };
  assert.equal(showsHydration(brioche), false);
});
