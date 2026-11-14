// Tests for lib/pantry.js. Run with: npm test
import assert from "node:assert/strict";
import { test } from "node:test";
import { coreWords, haveIngredient, isOptional, matchRecipes } from "./pantry.js";

test("descriptions, brackets and notes are dropped", () => {
  assert.deepEqual(coreWords("Bananas, very ripe (mashed)"), ["banana"]);
  assert.deepEqual(coreWords("cold unsalted butter"), ["butter"]);
  assert.deepEqual(coreWords("large eggs"), ["egg"]);
  assert.deepEqual(coreWords("fresh blueberries"), ["blueberry"]);
});

test("pantry words must all appear in the ingredient", () => {
  assert.ok(haveIngredient("bread flour", ["flour"]));
  assert.ok(!haveIngredient("all-purpose flour", ["bread flour"]));
  assert.ok(!haveIngredient("buttermilk", ["milk"]));
  assert.ok(haveIngredient("eggs", ["egg"]));
  assert.ok(!haveIngredient("salt", [""]));
});

test("peanut butter isn't butter, brown sugar isn't sugar", () => {
  assert.ok(!haveIngredient("creamy peanut butter", ["butter"]));
  assert.ok(haveIngredient("creamy peanut butter", ["peanut butter"]));
  assert.ok(!haveIngredient("light brown sugar", ["sugar"]));
  assert.ok(haveIngredient("sugar", ["sugar"]));
});

test("recipes that use none of what you typed are left out", () => {
  const recipes = [recipe(1, 5, ["all-purpose flour", "butter", "sugar"]), recipe(2, 4, ["all-purpose flour", "butter", "sugar", "chocolate chips"])];
  const results = matchRecipes(recipes, ["chocolate chips"], { useBasics: true });
  assert.deepEqual(results.map((r) => r.recipe.id), [2]);
});

test("optional ingredients are spotted", () => {
  assert.ok(isOptional("chopped walnuts (optional)"));
  assert.ok(!isOptional("walnuts"));
});

function recipe(id, rating, names) {
  return { id, rating, ingredients: names.map((name) => ({ name, amount: 1, unit: "g" })) };
}

test("recipes are ranked by fewest missing, then rating", () => {
  const recipes = [
    recipe(1, 4.0, ["flour", "water", "salt", "yeast"]),
    recipe(2, 4.9, ["flour", "water", "salt", "yeast", "olive oil"]),
    recipe(3, 4.5, ["flour", "water", "salt", "yeast", "walnuts (optional)"]),
  ];
  const results = matchRecipes(recipes, ["flour", "water", "salt", "yeast"]);
  assert.deepEqual(results.map((r) => r.recipe.id), [3, 1, 2]);
  assert.deepEqual(results[2].missing, ["olive oil"]);
});

test("the basics count when ticked", () => {
  const recipes = [recipe(1, 4, ["all-purpose flour", "eggs", "sugar", "lemon"])];
  // Without the basics, three are missing (still within the default limit of 3)
  assert.equal(matchRecipes(recipes, ["lemon"])[0].missing.length, 3);
  assert.equal(matchRecipes(recipes, ["lemon"], { maxMissing: 2 }).length, 0);
  assert.deepEqual(matchRecipes(recipes, ["lemon"], { useBasics: true })[0].missing, []);
});

test("an empty pantry finds nothing", () => {
  assert.deepEqual(matchRecipes([recipe(1, 4, ["flour"])], []), []);
});
