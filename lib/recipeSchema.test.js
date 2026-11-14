import assert from "node:assert/strict";
import { test } from "node:test";
import { jsonLdText, recipeJsonLd } from "./recipeSchema.js";

const recipe = {
  name: "Loaf </script>",
  category: "bread",
  servings: 12,
  prepTime: 12,
  bakeTime: 33,
  diet: ["vegetarian"],
  ingredients: [{ name: "flour", amount: 360, unit: "g" }, { name: "eggs", amount: 2, unit: "count" }],
  instructions: ["Mix.", "Bake."],
  tested: false,
  rating: 4.6,
  source: { name: "Elsewhere", url: "https://example.com/loaf" },
};

test("the recipe is described in schema.org terms", () => {
  const data = recipeJsonLd(recipe, "https://site/recipes/22");
  assert.equal(data["@type"], "Recipe");
  assert.equal(data.totalTime, "PT45M");
  assert.deepEqual(data.recipeIngredient, ["360 g flour", "2 eggs"]);
  assert.equal(data.recipeInstructions[1].text, "Bake.");
  assert.equal(data.suitableForDiet, "https://schema.org/VegetarianDiet");
  assert.equal(data.isBasedOn, "https://example.com/loaf");
});

test("another site's rating is not claimed", () => {
  assert.equal(recipeJsonLd(recipe, "u").aggregateRating, undefined);
  assert.equal(recipeJsonLd({ ...recipe, tested: true }, "u").aggregateRating.ratingValue, 4.6);
});

test("the JSON can't break out of its script tag", () => {
  assert.ok(!jsonLdText(recipeJsonLd(recipe, "u")).includes("</script>"));
});
