import assert from "node:assert/strict";
import { test } from "node:test";
import { keywordSearch, queryWords } from "./describeSearch.js";

function recipe(id, name, category, difficulty, ingredientNames, rating = 4) {
  return { id, name, category, difficulty, rating, ingredients: ingredientNames.map((n) => ({ name: n, amount: 1, unit: "g" })) };
}

const recipes = [
  recipe(1, "Brown Butter Chocolate Chip Cookies", "cookies", "easy", ["butter", "brown sugar", "chocolate chips"]),
  recipe(2, "Lemon Pound Cake", "cake", "medium", ["flour", "butter", "lemon"]),
  recipe(3, "Sourdough Loaf", "bread", "hard", ["bread flour", "water", "sourdough starter"]),
];

test("filler words are dropped", () => {
  assert.deepEqual(queryWords("Something chewy with brown butter"), ["chewy", "brown", "butter"]);
});

test("names, categories, ingredients and baking words all count", () => {
  assert.equal(keywordSearch(recipes, "something chewy with brown butter")[0].recipe.id, 1);
  assert.equal(keywordSearch(recipes, "lemony cake")[0].recipe.id, 2);
  assert.equal(keywordSearch(recipes, "a loaf")[0].recipe.id, 3);
  assert.equal(keywordSearch(recipes, "easy cookies")[0].recipe.id, 1);
});

test("the reason names the matching words", () => {
  assert.match(keywordSearch(recipes, "lemony cake")[0].reason, /lemony/);
});

test("nothing useful, nothing found", () => {
  assert.deepEqual(keywordSearch(recipes, "the a and"), []);
  assert.deepEqual(keywordSearch(recipes, "pizza"), []);
});
