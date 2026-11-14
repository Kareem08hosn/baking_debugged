// Tests for lib/featured.js. Run with: npm test
import assert from "node:assert/strict";
import { test } from "node:test";
import { pickDemoRecipe, pickFeatured } from "./featured.js";

// Small made-up recipes with only the fields these functions read.
function recipe(id, category, rating, ingredientNames = ["flour"]) {
  return {
    id,
    category,
    rating,
    ingredients: ingredientNames.map((name) => ({
      name,
      amount: 100,
      unit: "g",
    })),
  };
}

test("the lead is the top-rated recipe", () => {
  const recipes = [recipe(1, "cake", 4.1), recipe(2, "bread", 4.9)];
  assert.equal(pickFeatured(recipes).lead.id, 2);
});

test("the others each come from a different category", () => {
  const recipes = [
    recipe(1, "cookies", 4.9),
    recipe(2, "cookies", 4.8), // same category as the lead: skipped
    recipe(3, "bread", 4.7),
    recipe(4, "bread", 4.6), // bread is already used: skipped
    recipe(5, "cake", 4.5),
    recipe(6, "pie", 4.4),
  ];
  const { others } = pickFeatured(recipes);
  assert.deepEqual(
    others.map((item) => item.id),
    [3, 5, 6]
  );
});

test("no recipes gives no lead and an empty list", () => {
  assert.deepEqual(pickFeatured([]), { lead: null, others: [] });
});

test("the demo recipe is the bread with the fewest ingredients", () => {
  const recipes = [
    recipe(1, "cake", 4.9, ["flour"]),
    recipe(2, "bread", 4.0, ["flour", "water", "yeast", "salt"]),
    recipe(3, "bread", 4.0, ["flour", "water", "yeast"]),
  ];
  assert.equal(pickDemoRecipe(recipes).id, 3);
});

test("with no bread, the demo falls back to any recipe", () => {
  assert.equal(pickDemoRecipe([recipe(1, "cake", 4.9)]).id, 1);
  assert.equal(pickDemoRecipe([]), null);
});
