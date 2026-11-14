// The chemistry explainers: their names, and which recipes show each one.
//
// The full text lives in lib/chemistry/content.js. This file is kept small
// on purpose: the recipe page runs in the browser and imports it, and it
// shouldn't have to download every explainer to show three links.
import { showsHydration } from "../scaler.js";

// "match" says which recipes show the idea. A recipe matches if it passes
// every rule that is given:
//   categories:  its category is one of these
//   ingredients: one of its ingredient names contains one of these words
//   names:       its name contains one of these words
//   hydration:   it is a bread dough with a hydration figure
export const TOPICS = [
  {
    slug: "leaveners",
    number: 1,
    title: "Baking soda, baking powder and yeast",
    short: "Three ways to fill a bake with gas, and why they aren’t swappable.",
    match: { ingredients: ["baking soda", "baking powder", "yeast", "starter"] },
  },
  {
    slug: "gluten",
    number: 2,
    title: "Gluten development",
    short: "The stretchy network that holds bread up and makes muffins tough.",
    match: { categories: ["bread", "buns", "flatbread"] },
  },
  {
    slug: "hydration",
    number: 3,
    title: "Hydration and baker’s percentages",
    short: "Why bakers write water as a percentage of flour.",
    match: { hydration: true },
  },
  {
    slug: "sugar",
    number: 4,
    title: "What sugar does besides sweeten",
    short: "Moisture, tenderness, spread, colour and air.",
    match: { categories: ["cookies", "cake", "bars"] },
  },
  {
    slug: "fats",
    number: 5,
    title: "Butter vs oil",
    short: "Flaky, fluffy or moist depends on the fat and its temperature.",
    match: { categories: ["pie", "pastry", "scones"] },
  },
  {
    slug: "eggs",
    number: 6,
    title: "What eggs do",
    short: "Structure, lift, richness and the glue between fat and water.",
    match: { categories: ["cake", "muffins", "quick bread"], ingredients: ["egg"] },
  },
  {
    slug: "browning",
    number: 7,
    title: "Maillard reaction and caramelisation",
    short: "Where crust colour and toasty flavour come from.",
    match: { names: ["pretzel", "brioche", "challah", "naan", "snickerdoodle"] },
  },
  {
    slug: "oven",
    number: 8,
    title: "Oven temperature",
    short: "A race between rising and setting, refereed by your oven dial.",
    match: { categories: ["cake", "bread"] },
  },
];

// Finds one topic by its slug, or undefined.
export function getTopic(slug) {
  return TOPICS.find((topic) => topic.slug === slug);
}

// True if one text contains any of the words in a list.
function containsAny(text, words) {
  const lower = text.toLowerCase();
  return words.some((word) => lower.includes(word));
}

// Does this recipe show this topic? See "match" above.
export function recipeShowsTopic(recipe, topic) {
  const { categories, ingredients, names, hydration } = topic.match;
  if (categories && !categories.includes(recipe.category)) {
    return false;
  }
  if (
    ingredients &&
    !recipe.ingredients.some((ingredient) => containsAny(ingredient.name, ingredients))
  ) {
    return false;
  }
  if (names && !containsAny(recipe.name, names)) {
    return false;
  }
  if (hydration && !showsHydration(recipe)) {
    return false;
  }
  return true;
}

// The best-rated recipes that show a topic, at most "count" of them.
export function recipesForTopic(topic, recipes, count = 3) {
  return recipes
    .filter((recipe) => recipeShowsTopic(recipe, topic))
    .toSorted((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, count);
}

// The order topics are suggested on a recipe page: the most specific first.
// Nearly every recipe has a leavener and goes in an oven, so those come last.
const SPECIFIC_FIRST = [
  "hydration",
  "browning",
  "fats",
  "eggs",
  "gluten",
  "sugar",
  "leaveners",
  "oven",
];

// The topics a recipe shows, most specific first, at most "count".
export function topicsForRecipe(recipe, count = 3) {
  return SPECIFIC_FIRST.map(getTopic)
    .filter((topic) => recipeShowsTopic(recipe, topic))
    .slice(0, count);
}
