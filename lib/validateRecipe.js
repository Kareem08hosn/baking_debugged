// Checks a recipe sent from the add-recipe form before it is saved.
//
// The form already checks most of this in the browser, but anything that
// comes from a browser can be faked, so the server checks again with this.
// Plain function, no database: tested in lib/validateRecipe.test.js.
import { getPanById } from "./pans.js";

const DIFFICULTIES = ["easy", "medium", "hard"];
const DIETS = ["vegetarian", "vegan"];
const UNITS = ["g", "count"];

// Limits that keep one recipe a sensible size.
export const LIMITS = {
  name: 120,
  category: 40,
  ingredients: 60,
  ingredientName: 80,
  steps: 50,
  stepLength: 1000,
};

// A number within [min, max]. typeof checks it is really a number, and
// Number.isFinite rules out NaN and Infinity.
function isNumberBetween(value, min, max) {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}

// A string that isn't blank once trimmed and isn't longer than max.
function isText(value, max) {
  return typeof value === "string" && value.trim() !== "" && value.trim().length <= max;
}

// Returns { recipe } with tidied values if everything is fine, or
// { error: "message for the person" } for the first problem found.
export function validateRecipe(input) {
  if (typeof input !== "object" || input === null) {
    return { error: "The recipe is missing." };
  }
  if (!isText(input.name, LIMITS.name)) {
    return { error: `Give the recipe a name (up to ${LIMITS.name} characters).` };
  }
  if (!isText(input.category, LIMITS.category)) {
    return { error: `Give it a category (up to ${LIMITS.category} characters).` };
  }
  if (!DIFFICULTIES.includes(input.difficulty)) {
    return { error: "Choose easy, medium or hard." };
  }
  if (!isNumberBetween(input.prepTime, 0, 10000) || !isNumberBetween(input.bakeTime, 0, 10000)) {
    return { error: "Prep and bake times must be minutes, 0 or more." };
  }
  if (!isNumberBetween(input.servings, 0.1, 1000)) {
    return { error: "Servings must be more than 0." };
  }
  if (!isNumberBetween(input.rating, 1, 5)) {
    return { error: "The rating must be between 1 and 5." };
  }
  if (input.pan !== null && !getPanById(input.pan)) {
    return { error: "Choose a pan from the list, or no pan." };
  }
  if (!Array.isArray(input.diet) || !input.diet.every((diet) => DIETS.includes(diet))) {
    return { error: "Choose a diet from the list." };
  }

  const { ingredients, instructions } = input;
  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    return { error: "Add at least one ingredient." };
  }
  if (ingredients.length > LIMITS.ingredients) {
    return { error: `A recipe can have up to ${LIMITS.ingredients} ingredients.` };
  }
  for (const [index, ingredient] of ingredients.entries()) {
    const ok =
      isText(ingredient?.name, LIMITS.ingredientName) &&
      isNumberBetween(ingredient.amount, 0.01, 100000) &&
      UNITS.includes(ingredient.unit);
    if (!ok) {
      return { error: `Check ingredient ${index + 1}: it needs a name, an amount above 0 and a unit.` };
    }
  }

  if (!Array.isArray(instructions) || instructions.length === 0) {
    return { error: "Add at least one instruction step." };
  }
  if (instructions.length > LIMITS.steps) {
    return { error: `A recipe can have up to ${LIMITS.steps} steps.` };
  }
  if (!instructions.every((step) => isText(step, LIMITS.stepLength))) {
    return { error: `Each step must have text, up to ${LIMITS.stepLength} characters.` };
  }

  // Everything is fine: return a tidy copy, built field by field so nothing
  // extra sent by the browser (an "owner" or "id", say) gets through.
  return {
    recipe: {
      name: input.name.trim(),
      category: input.category.trim().toLowerCase(),
      difficulty: input.difficulty,
      prepTime: Math.round(input.prepTime),
      bakeTime: Math.round(input.bakeTime),
      servings: input.servings,
      pan: input.pan,
      rating: input.rating,
      // Vegan food is also vegetarian
      diet: input.diet.includes("vegan") ? ["vegetarian", "vegan"] : [...new Set(input.diet)],
      ingredients: ingredients.map((ingredient) => ({
        name: ingredient.name.trim(),
        amount: ingredient.amount,
        unit: ingredient.unit,
      })),
      instructions: instructions.map((step) => step.trim()),
      // The person baked it and rated it themselves, so it counts as tested.
      tested: true,
    },
  };
}
