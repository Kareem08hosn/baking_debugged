// Server action: AI substitution suggestions (Phase 6). The notebook's own
// swaps (lib/substitutions.js) need no AI and are shown in the browser.
"use server";

import { generateJson } from "@/lib/ai/gemini";
import { normalizeText } from "@/lib/ai/keys";
import { runAiTask } from "@/lib/ai/run";
import { checkSubstitution, substitutionPrompt } from "@/lib/ai/tasks";
import { getOwnRecipe, getRecipeById } from "@/lib/recipes";
import { findSwaps } from "@/lib/substitutions";

// Returns { result: { substitutes, note }, cached } or { error }.
export async function askSubstitution({ ingredient, have = "", recipeId = null }) {
  const name = normalizeText(ingredient);
  const instead = normalizeText(have);
  if (name.length < 2 || name.length > 60 || instead.length > 60) {
    return { error: "Name one ingredient (up to 60 characters)." };
  }

  // The recipe gives the AI context ("butter in shortbread" is different
  // from "butter in muffins"). Site recipes first, then the person's own.
  const recipe = recipeId
    ? ((await getRecipeById(recipeId)) ?? (await getOwnRecipe(recipeId)))
    : null;

  // The cache key: the question, plus the recipe's ingredients so an edited
  // recipe gets a fresh answer.
  const input = {
    ingredient: name,
    have: instead,
    recipe: recipe ? recipe.ingredients.map((item) => `${item.name}:${item.amount}${item.unit}`) : null,
  };

  return runAiTask({
    kind: "substitution",
    input,
    ask: async () => {
      const answer = await generateJson(
        substitutionPrompt({ ingredient: name, have: instead, recipe, knownSwaps: findSwaps(name) })
      );
      return checkSubstitution(answer);
    },
  });
}
