// Tests for lib/bakes.js. Run with: npm test
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  bakeFromRecipe,
  fromBakeRow,
  ovenTempFromSteps,
  readNumber,
  summarizeBakes,
  toBakeRow,
  today,
  validateBake,
} from "./bakes.js";

test("numbers are read out of text with units", () => {
  assert.equal(readNumber("500 g"), 500);
  assert.equal(readNumber("75%"), 75);
  assert.equal(readNumber("220°C"), 220);
  assert.equal(readNumber("1,000"), 1000);
  assert.equal(readNumber(""), null);
  assert.ok(Number.isNaN(readNumber("lots")));
});

test("today is written YYYY-MM-DD in local time", () => {
  assert.equal(today(new Date(2026, 0, 5)), "2026-01-05");
});

test("a minimal bake gets today's date and nulls", () => {
  const { bake } = validateBake({ title: "  Sourdough " });
  assert.equal(bake.title, "Sourdough");
  assert.equal(bake.bakedOn, today());
  assert.equal(bake.rating, null);
  assert.equal(bake.recipeId, null);
});

test("form text is turned into numbers", () => {
  const { bake } = validateBake({ title: "Loaf", rating: "4.5", flourG: "500", hydrationPct: "72%", recipeId: "22" });
  assert.equal(bake.rating, 4.5);
  assert.equal(bake.flourG, 500);
  assert.equal(bake.hydrationPct, 72);
  assert.equal(bake.recipeId, 22);
});

test("bad bakes are refused", () => {
  assert.ok(validateBake({ title: "" }).error);
  assert.ok(validateBake({ title: "Loaf", rating: "6" }).error);
  assert.ok(validateBake({ title: "Loaf", ovenTempC: "hot" }).error);
  assert.ok(validateBake({ title: "Loaf", bakedOn: "2026-02-31" }).error);
  assert.ok(validateBake({ title: "Loaf", bakedOn: "05/03/2026" }).error);
  assert.ok(validateBake(null).error);
});

test("dates may use slashes", () => {
  assert.equal(validateBake({ title: "Loaf", bakedOn: "2026/3/5" }).bake.bakedOn, "2026-03-05");
});

test("a bake survives the trip to a database row and back", () => {
  const { bake } = validateBake({ title: "Loaf", flourG: "500", recipeId: 3 });
  const back = fromBakeRow({ id: 9, ...toBakeRow(bake), flour_g: "500" });
  assert.equal(back.id, 9);
  assert.equal(back.flourG, 500); // text from the database becomes a number
  assert.equal(back.recipeId, 3);
});

test("the oven temperature is found in the steps", () => {
  assert.equal(ovenTempFromSteps(["Mix.", "Heat the oven to 200°C.", "Bake at 180 °C"]), 200);
  assert.equal(ovenTempFromSteps(["Mix."]), null);
});

test("a bread recipe pre-fills the bake", () => {
  const recipe = {
    id: 22,
    name: "Loaf",
    bakeTime: 33,
    ingredients: [
      { name: "bread flour", amount: 500, unit: "g" },
      { name: "water", amount: 350, unit: "g" },
      { name: "butter, melted", amount: 20, unit: "g" },
      { name: "buttermilk", amount: 0, unit: "g" },
      { name: "sugar", amount: 10, unit: "g" },
      { name: "instant yeast", amount: 7, unit: "g" },
    ],
    instructions: ["Knead.", "Bake at 220°C."],
  };
  const bake = bakeFromRecipe(recipe);
  assert.equal(bake.flourG, 500);
  assert.equal(bake.waterG, 350);
  assert.equal(bake.fatG, 20); // butter, not buttermilk
  assert.equal(bake.sugarG, 10);
  assert.equal(bake.leavener, "instant yeast");
  assert.equal(bake.hydrationPct, 70);
  assert.equal(bake.ovenTempC, 220);
  assert.equal(bake.bakeTimeMin, 33);
});

test("a log is summed up", () => {
  const summary = summarizeBakes([
    { title: "Loaf", rating: 4, bakedOn: "2026-01-02" },
    { title: "Loaf", rating: 5, bakedOn: "2026-03-01" },
    { title: "Cookies", rating: null, bakedOn: "2026-02-10" },
  ]);
  assert.deepEqual(summary, {
    count: 3,
    averageRating: 4.5,
    mostBaked: { title: "Loaf", count: 2 },
    lastBakedOn: "2026-03-01",
  });
  assert.equal(summarizeBakes([]).averageRating, null);
});
