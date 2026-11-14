// Tests for lib/validateRecipe.js. Run with: npm test
import assert from "node:assert/strict";
import { test } from "node:test";
import { validateRecipe } from "./validateRecipe.js";

// A valid recipe; each test changes one thing.
function goodRecipe() {
  return {
    name: "  Brown Butter Blondies ",
    category: "Bars",
    difficulty: "easy",
    prepTime: 15,
    bakeTime: 25,
    servings: 16,
    pan: "square-20",
    rating: 4.5,
    diet: ["vegetarian"],
    ingredients: [
      { name: "butter", amount: 170, unit: "g" },
      { name: "eggs", amount: 2, unit: "count" },
    ],
    instructions: ["Brown the butter.", "  Mix and bake.  "],
  };
}

test("a good recipe passes and comes back tidied", () => {
  const { recipe, error } = validateRecipe(goodRecipe());
  assert.equal(error, undefined);
  assert.equal(recipe.name, "Brown Butter Blondies");
  assert.equal(recipe.category, "bars");
  assert.equal(recipe.instructions[1], "Mix and bake.");
  assert.equal(recipe.tested, true);
});

test("extra fields such as owner or id are dropped", () => {
  const input = { ...goodRecipe(), owner: "someone-else", id: 1 };
  const { recipe } = validateRecipe(input);
  assert.equal("owner" in recipe, false);
  assert.equal("id" in recipe, false);
});

test("vegan also counts as vegetarian", () => {
  const { recipe } = validateRecipe({ ...goodRecipe(), diet: ["vegan"] });
  assert.deepEqual(recipe.diet, ["vegetarian", "vegan"]);
});

test("no pan is allowed, an unknown pan is not", () => {
  assert.ok(validateRecipe({ ...goodRecipe(), pan: null }).recipe);
  assert.ok(validateRecipe({ ...goodRecipe(), pan: "wok" }).error);
});

test("bad values are refused with a message", () => {
  const cases = [
    { name: "   " },
    { difficulty: "extreme" },
    { prepTime: -5 },
    { servings: 0 },
    { rating: 6 },
    { rating: "5" }, // text, not a number
    { diet: ["keto"] },
    { ingredients: [] },
    { ingredients: [{ name: "flour", amount: 0, unit: "g" }] },
    { ingredients: [{ name: "flour", amount: 100, unit: "cup" }] },
    { instructions: [] },
    { instructions: ["   "] },
  ];
  for (const change of cases) {
    const { error } = validateRecipe({ ...goodRecipe(), ...change });
    assert.equal(typeof error, "string", JSON.stringify(change));
  }
});

test("missing input is refused", () => {
  assert.ok(validateRecipe(null).error);
});
