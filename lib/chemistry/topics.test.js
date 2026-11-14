// Tests for lib/chemistry/topics.js. Run with: npm test
import assert from "node:assert/strict";
import { test } from "node:test";
import { TOPICS, getTopic, recipesForTopic, topicsForRecipe } from "./topics.js";

function recipe(id, category, rating, ingredientNames, name = "Test") {
  return {
    id,
    name,
    category,
    rating,
    ingredients: ingredientNames.map((n) => ({ name: n, amount: 100, unit: "g" })),
  };
}

const bread = recipe(1, "bread", 4.5, ["bread flour", "water", "instant yeast", "salt"]);
const cake = recipe(2, "cake", 4.8, ["flour", "sugar", "butter", "baking powder"]);
cake.ingredients.push({ name: "eggs", amount: 3, unit: "count" });

test("every topic has a unique slug and number", () => {
  assert.equal(new Set(TOPICS.map((t) => t.slug)).size, TOPICS.length);
  assert.equal(new Set(TOPICS.map((t) => t.number)).size, TOPICS.length);
});

test("a yeast bread shows hydration and gluten before leaveners", () => {
  const slugs = topicsForRecipe(bread).map((t) => t.slug);
  assert.deepEqual(slugs, ["hydration", "gluten", "leaveners"]);
});

test("a cake with eggs shows eggs and sugar", () => {
  const slugs = topicsForRecipe(cake).map((t) => t.slug);
  assert.deepEqual(slugs, ["eggs", "sugar", "leaveners"]);
});

test("recipes for a topic are the best rated that match", () => {
  const other = recipe(3, "bread", 4.9, ["flour", "water", "yeast"]);
  const found = recipesForTopic(getTopic("gluten"), [bread, cake, other]);
  assert.deepEqual(found.map((r) => r.id), [3, 1]);
});
