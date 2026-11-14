// "Find a recipe by describing it", without AI: matches the words of the
// description against recipe names, categories and ingredients, with a
// small dictionary of baking words ("chewy", "fluffy", "quick"). The AI
// version (embeddings) replaces this once the Gemini key is set; this stays
// as the fallback. No React: tested in lib/describeSearch.test.js.
import { coreWords } from "./pantry.js";

// Words that say nothing about the recipe itself.
const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "with", "without", "of", "for", "to", "in", "on",
  "something", "some", "i", "want", "would", "like", "make", "bake", "recipe",
  "that", "is", "it", "my", "me", "very", "really", "bit", "little", "good", "nice",
]);

// What texture and mood words point to. Each word adds its hints to the search.
const MEANINGS = {
  chewy: { ingredients: ["brown sugar", "oats"], categories: ["cookies", "bars"] },
  crispy: { categories: ["cookies"], names: ["biscotti", "shortbread"] },
  crunchy: { categories: ["cookies"], names: ["biscotti"] },
  fluffy: { categories: ["cake", "muffins", "buns"] },
  soft: { categories: ["buns", "cake"], names: ["soft"] },
  light: { categories: ["cake"], names: ["sponge", "chiffon"] },
  rich: { ingredients: ["butter", "chocolate", "cream"] },
  fudgy: { ingredients: ["chocolate", "cocoa"], categories: ["bars"] },
  flaky: { categories: ["pie", "pastry", "scones"] },
  quick: { difficulty: "easy" },
  easy: { difficulty: "easy" },
  simple: { difficulty: "easy" },
  beginner: { difficulty: "easy" },
  loaf: { categories: ["bread", "quick bread"] },
  breakfast: { categories: ["muffins", "scones", "quick bread", "buns"] },
  lemony: { ingredients: ["lemon"] },
  fruity: { ingredients: ["apple", "banana", "berry", "berries", "lemon"] },
  spiced: { ingredients: ["cinnamon", "ginger", "nutmeg", "cardamom"] },
  chocolatey: { ingredients: ["chocolate", "cocoa"] },
};

// The meaningful words of a description: "Something chewy with brown
// butter" -> ["chewy", "brown", "butter"]
export function queryWords(query) {
  return String(query ?? "")
    .toLowerCase()
    .split(/[^a-z-]+/)
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word));
}

// Scores every recipe against a description and returns the best matches:
// [{ recipe, score, reason }], best first, at most "limit".
export function keywordSearch(recipes, query, limit = 12) {
  const words = queryWords(query);
  if (words.length === 0) {
    return [];
  }
  const results = [];
  for (const recipe of recipes) {
    const nameWords = coreWords(recipe.name);
    const ingredientWords = recipe.ingredients.flatMap((item) => coreWords(item.name));
    let score = 0;
    const matched = new Set();

    for (const word of words) {
      // Baking words ("easy", "loaf", "chewy") count only through what
      // they mean, below, not as literal words in a name.
      const meaning = MEANINGS[word];
      if (meaning) {
        const hits =
          (meaning.categories?.includes(recipe.category) ? 1 : 0) +
          (meaning.difficulty === recipe.difficulty ? 1 : 0) +
          (meaning.names?.some((name) => recipe.name.toLowerCase().includes(name)) ? 1 : 0) +
          (meaning.ingredients?.some((name) => recipe.ingredients.some((item) => item.name.toLowerCase().includes(name))) ? 1 : 0);
        if (hits > 0) {
          score += 2 * hits;
          matched.add(word);
        }
        continue; // skip the literal checks for this word
      }
      const [singular] = coreWords(word); // "cookies" -> "cookie"
      if (singular && nameWords.includes(singular)) {
        score += 3;
        matched.add(word);
      }
      if (recipe.category.includes(singular ?? word)) {
        score += 2;
        matched.add(word);
      }
      if (singular && ingredientWords.includes(singular)) {
        score += 1;
        matched.add(word);
      }
    }
    if (score > 0) {
      results.push({ recipe, score, reason: `Matches: ${[...matched].join(", ")}` });
    }
  }
  return results
    .toSorted((a, b) => b.score - a.score || (b.recipe.rating ?? 0) - (a.recipe.rating ?? 0))
    .slice(0, limit);
}
