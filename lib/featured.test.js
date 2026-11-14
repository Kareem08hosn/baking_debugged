// Tests for lib/featured.js. Run with: npm test
import assert from "node:assert/strict";
import { test } from "node:test";
import { pickDemoRecipe, pickFeatured } from "./featured.js";

// Small made-up recipes with only the fields these functions read.
function recipe(id, category, ingredientNames = ["flour"]) {
  return {
    id,
    category,
    ingredients: ingredientNames.map((name) => ({
      name,
      amount: 100,
      unit: "g",
    })),
  };
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
// Twelve recipes: three each of four categories, grouped like the real list.
const CATEGORIES = ["cookies", "bread", "cake", "pie"];
const recipes = Array.from({ length: 12 }, (_, index) =>
  recipe(index + 1, CATEGORIES[Math.floor(index / 3)])
);

test("the lead stays the same all week, then changes", () => {
  const monday = 2900 * WEEK_MS;
  const sameWeek = monday + 6 * 24 * 60 * 60 * 1000;
  const nextWeek = monday + WEEK_MS;
  const lead = pickFeatured(recipes, 3, monday).lead;
  assert.equal(pickFeatured(recipes, 3, sameWeek).lead.id, lead.id);
  assert.notEqual(pickFeatured(recipes, 3, nextWeek).lead.id, lead.id);
});

test("every recipe gets a turn as the lead", () => {
  const leads = new Set();
  for (let week = 0; week < recipes.length; week++) {
    leads.add(pickFeatured(recipes, 3, week * WEEK_MS).lead.id);
  }
  assert.equal(leads.size, recipes.length);
});

test("the others each come from a different category, and not the lead's", () => {
  for (let week = 0; week < recipes.length; week++) {
    const { lead, others } = pickFeatured(recipes, 3, week * WEEK_MS);
    const categories = [lead, ...others].map((item) => item.category);
    assert.equal(others.length, 3);
    assert.equal(new Set(categories).size, 4);
  }
});

test("no recipes gives no lead and an empty list", () => {
  assert.deepEqual(pickFeatured([]), { lead: null, others: [] });
});

test("the demo recipe is the bread with the fewest ingredients", () => {
  const list = [
    recipe(1, "cake", ["flour"]),
    recipe(2, "bread", ["flour", "water", "yeast", "salt"]),
    recipe(3, "bread", ["flour", "water", "yeast"]),
  ];
  assert.equal(pickDemoRecipe(list).id, 3);
});

test("with no bread, the demo falls back to any recipe", () => {
  assert.equal(pickDemoRecipe([recipe(1, "cake")]).id, 1);
  assert.equal(pickDemoRecipe([]), null);
});
