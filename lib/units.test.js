// Tests for lib/units.js. Run them with: npm test
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ML_PER_CUP,
  ML_PER_TBSP,
  ML_PER_TSP,
  findGramsPerCup,
  formatAmount,
  formatUsVolume,
  gramsToMl,
  hasVolume,
  mlToGrams,
} from "./units.js";

test("an exact name finds its density", () => {
  assert.equal(findGramsPerCup("butter"), 227);
});

test("the longest matching name wins", () => {
  // "brown sugar" contains both "sugar" (200) and "brown sugar" (213)
  assert.equal(findGramsPerCup("brown sugar"), 213);
  assert.equal(findGramsPerCup("icing sugar"), 113);
  assert.equal(findGramsPerCup("sugar"), 200);
});

test("extra words and capitals still match", () => {
  assert.equal(findGramsPerCup("ripe bananas"), 227);
  assert.equal(findGramsPerCup("Bread Flour"), 120);
});

test("an unknown ingredient has no density", () => {
  assert.equal(findGramsPerCup("lemons"), null);
});

test("one cup's weight of an ingredient is one cup", () => {
  assert.equal(gramsToMl(120, 120), ML_PER_CUP);
});

test("grams to ml and back gives the starting weight", () => {
  const ml = gramsToMl(250, 120);
  // toFixed(6) rounds away tiny floating-point errors before comparing
  assert.equal(mlToGrams(ml, 120).toFixed(6), "250.000000");
});

test("a cup of water weighs about 237 g", () => {
  assert.equal(Math.round(mlToGrams(ML_PER_CUP, 237)), 237);
});

test("whole and fractional cups", () => {
  assert.equal(formatUsVolume(ML_PER_CUP), "1 cup");
  assert.equal(formatUsVolume(ML_PER_CUP * 2), "2 cups");
  assert.equal(formatUsVolume(ML_PER_CUP * 0.5), "½ cup");
  assert.equal(formatUsVolume(ML_PER_CUP * 2.5), "2 ½ cups");
  assert.equal(formatUsVolume(ML_PER_CUP / 3), "⅓ cup");
});

test("cups round to the nearest fraction a cup set has", () => {
  // 2.08 cups is closest to 2; 1.9 cups rounds up to 2
  assert.equal(formatUsVolume(ML_PER_CUP * 2.08), "2 cups");
  assert.equal(formatUsVolume(ML_PER_CUP * 1.9), "2 cups");
  // 0.7 cups is closest to ⅔
  assert.equal(formatUsVolume(ML_PER_CUP * 0.7), "⅔ cup");
});

test("tablespoons below a quarter cup", () => {
  assert.equal(formatUsVolume(ML_PER_TBSP), "1 tbsp");
  assert.equal(formatUsVolume(ML_PER_TBSP * 2.5), "2 ½ tbsp");
});

test("teaspoons below a tablespoon", () => {
  assert.equal(formatUsVolume(ML_PER_TSP), "1 tsp");
  assert.equal(formatUsVolume(ML_PER_TSP * 0.5), "½ tsp");
  assert.equal(formatUsVolume(ML_PER_TSP * 1.75), "1 ¾ tsp");
});

test("almost nothing is a pinch", () => {
  assert.equal(formatUsVolume(ML_PER_TSP * 0.05), "a pinch");
});

const FLOUR = { name: "flour", amount: 240, unit: "g" };
const EGGS = { name: "eggs", amount: 2, unit: "count" };
const LEMON_ZEST = { name: "lemon zest", amount: 6, unit: "g" };
const SALT = { name: "salt", amount: 6, unit: "g" };

test("grams is the default and shows the stored amount", () => {
  assert.equal(formatAmount(FLOUR), "240 g");
  assert.equal(formatAmount(FLOUR, "grams"), "240 g");
});

test("cups and spoons", () => {
  // 240 g of flour at 120 g per cup is 2 cups
  assert.equal(formatAmount(FLOUR, "us"), "2 cups");
  // 6 g of salt at 288 g per cup is 1 teaspoon
  assert.equal(formatAmount(SALT, "us"), "1 tsp");
});

test("millilitres", () => {
  // 2 cups = 473.176 ml
  assert.equal(formatAmount(FLOUR, "ml"), "473 ml");
  // 1 tsp = 4.9 ml: small amounts keep one decimal
  assert.equal(formatAmount(SALT, "ml"), "4.9 ml");
});

test("counts never change", () => {
  assert.equal(formatAmount(EGGS, "grams"), "2");
  assert.equal(formatAmount(EGGS, "us"), "2");
  assert.equal(formatAmount(EGGS, "ml"), "2");
});

test("an ingredient with no density stays in grams", () => {
  assert.equal(formatAmount(LEMON_ZEST, "us"), "6 g");
  assert.equal(formatAmount(LEMON_ZEST, "ml"), "6 g");
});

test("hasVolume says which ingredients can be converted", () => {
  assert.equal(hasVolume(FLOUR), true);
  assert.equal(hasVolume(EGGS), false);
  assert.equal(hasVolume(LEMON_ZEST), false);
});
