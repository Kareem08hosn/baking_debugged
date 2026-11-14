// Recipe data for search engines, in the schema.org "Recipe" format
// (JSON-LD). Google reads it to show recipes with times and ratings.
// No React: tested in lib/recipeSchema.test.js.
import { formatAmount } from "./units.js";

// Minutes -> the ISO 8601 duration search engines expect: 75 -> "PT75M"
function duration(minutes) {
  return `PT${Math.max(0, Math.round(minutes))}M`;
}

export function recipeJsonLd(recipe, url) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.name,
    url,
    recipeCategory: recipe.category,
    recipeYield: `${recipe.servings} servings`,
    prepTime: duration(recipe.prepTime),
    cookTime: duration(recipe.bakeTime),
    totalTime: duration(recipe.prepTime + recipe.bakeTime),
    // "250 g flour", "2 eggs"
    recipeIngredient: recipe.ingredients.map((item) => `${formatAmount(item)} ${item.name}`),
    recipeInstructions: recipe.instructions.map((text) => ({ "@type": "HowToStep", text })),
    author: { "@type": "Organization", name: "Baking Debugged" },
  };
  if (recipe.diet.includes("vegan")) {
    data.suitableForDiet = "https://schema.org/VeganDiet";
  } else if (recipe.diet.includes("vegetarian")) {
    data.suitableForDiet = "https://schema.org/VegetarianDiet";
  }
  // Only a rating made HERE is claimed as this site's. Untested recipes
  // carry another site's stars, which must not be passed off as ours.
  if (recipe.tested === true && recipe.rating != null) {
    data.aggregateRating = { "@type": "AggregateRating", ratingValue: recipe.rating, ratingCount: 1, bestRating: 5 };
  }
  if (recipe.source?.url) {
    data.isBasedOn = recipe.source.url;
  }
  return data;
}

// The JSON as text that is safe inside a <script> tag: "<" is escaped so
// a recipe name containing "</script>" can't end the tag early.
export function jsonLdText(data) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
