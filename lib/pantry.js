// "What can I make with what I have?": ranks recipes by how few of their
// ingredients you're missing. No React, no database: tested in
// lib/pantry.test.js.

// Things nearly every kitchen has. With "I have the basics" ticked, these
// count as in the pantry.
export const BASICS = ["water", "salt", "sugar", "all-purpose flour", "butter", "egg", "milk", "baking powder", "baking soda", "vanilla extract"];

// Words that describe an ingredient's state, not what it is: "cold butter"
// is still butter.
const DESCRIPTIONS = new Set([
  "cold", "warm", "hot", "lukewarm", "boiling", "ice", "room", "temperature",
  "melted", "softened", "soft", "large", "small", "medium", "chopped", "diced",
  "sliced", "grated", "fresh", "ripe", "mashed", "unsalted", "salted", "packed",
  "finely", "coarsely", "toasted", "whole", "plain", "full-fat", "cooled",
]);

// Turns a word into its singular form for the common cases: "eggs" -> "egg",
// "berries" -> "berry". Words ending in "ss" ("glass") are left alone.
function singular(word) {
  if (word.endsWith("ies")) return `${word.slice(0, -3)}y`;
  if (word.endsWith("oes")) return word.slice(0, -2);
  if (word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}

// The words that say what an ingredient is:
// "Bananas, very ripe (mashed)" -> ["banana"]
export function coreWords(name) {
  const main = name
    .toLowerCase()
    .replace(/\(.*?\)/g, " ") // drop anything in brackets
    .split(",")[0]; // drop notes after a comma
  return main
    .split(/[^a-z-]+/) // split on anything that isn't a letter or hyphen
    .filter((word) => word !== "" && !DESCRIPTIONS.has(word))
    .map(singular);
}

// An ingredient marked optional, or only used on top, isn't needed to bake.
export function isOptional(name) {
  return /\boptional\b/i.test(name);
}

// Phrases that name a different ingredient from their last word: peanut
// butter isn't butter, brown sugar isn't plain sugar. If an ingredient has
// one of these, your pantry item must have the whole phrase too.
const DISTINCT = [
  "peanut butter", "almond butter", "brown sugar", "powdered sugar", "icing sugar",
  "confectioners sugar", "cream cheese", "sour cream", "coconut milk",
  "condensed milk", "evaporated milk", "almond milk", "milk powder", "dry milk",
  "almond flour", "rye flour", "whole wheat flour", "cake flour", "corn syrup",
  "maple syrup", "golden syrup", "olive oil", "coconut oil",
];

// Do you have this ingredient? Yes if every word of something in your
// pantry appears in it: "flour" covers "bread flour", but "bread flour"
// doesn't cover "all-purpose flour", and "milk" doesn't cover "buttermilk".
export function haveIngredient(name, pantry) {
  const words = coreWords(name);
  const text = words.join(" ");
  const phrases = DISTINCT.filter((phrase) => text.includes(phrase));
  return pantry.some((item) => {
    const wanted = coreWords(item);
    const wantedText = wanted.join(" ");
    return (
      wanted.length > 0 &&
      wanted.every((word) => words.includes(word)) &&
      phrases.every((phrase) => wantedText.includes(phrase))
    );
  });
}

// Ranks recipes for a pantry. Returns
//   [{ recipe, missing: [ingredient names], uses, needed }]
// Order: fewest missing first, then the ones that use more of what you
// typed ("uses"), then the best rated. Left out: recipes missing more than
// maxMissing ingredients, and recipes that use none of what you typed (with
// the basics ticked, plain shortbread would otherwise match everything).
export function matchRecipes(recipes, pantryItems, { useBasics = false, maxMissing = 3 } = {}) {
  const pantry = [...pantryItems, ...(useBasics ? BASICS : [])];
  if (pantryItems.length === 0) {
    return [];
  }
  const results = [];
  for (const recipe of recipes) {
    const needed = recipe.ingredients.filter((ingredient) => !isOptional(ingredient.name));
    const missing = needed
      .filter((ingredient) => !haveIngredient(ingredient.name, pantry))
      .map((ingredient) => ingredient.name);
    // [...new Set()] drops repeats, e.g. "sugar" used twice in one recipe
    const uniqueMissing = [...new Set(missing)];
    // How many of the things you typed this recipe uses
    const uses = pantryItems.filter((item) =>
      needed.some((ingredient) => haveIngredient(ingredient.name, [item]))
    ).length;
    if (uniqueMissing.length <= maxMissing && (uses > 0 || pantryItems.length === 0)) {
      results.push({ recipe, missing: uniqueMissing, uses, needed: needed.length });
    }
  }
  return results.toSorted(
    (a, b) =>
      a.missing.length - b.missing.length ||
      b.uses - a.uses ||
      (b.recipe.rating ?? 0) - (a.recipe.rating ?? 0)
  );
}
