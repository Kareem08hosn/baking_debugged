// Hardcoded recipe data for now. Later (Phase 3) this moves into a database.
// It has its own file so several pages can share it. "export" makes it
// importable from other files (like "public" in Java).
//
// PLACEHOLDER recipes: the amounts and steps are stand-ins until the real
// recipes replace them.
//
// Shape of one recipe:
//   bakeTime, prepTime  minutes, stored as numbers so we can sort and add them
//   servings            how many portions the amounts below make
//   ingredients         { name, amount, unit } where unit is "g" (grams) or
//                       "count" (whole items like eggs). Grams everywhere else
//                       so scaling and baker's percentages are simple maths.
//   diet                every diet the recipe fits (vegan food is also vegetarian)
export const recipes = [
  {
    id: 1,
    name: "Banana Bread",
    category: "bread",
    difficulty: "easy",
    prepTime: 15,
    bakeTime: 60,
    servings: 10,
    rating: 4.5, // out of 5
    diet: ["vegetarian"],
    ingredients: [
      { name: "ripe bananas", amount: 350, unit: "g" },
      { name: "flour", amount: 250, unit: "g" },
      { name: "sugar", amount: 150, unit: "g" },
      { name: "butter", amount: 115, unit: "g" },
      { name: "eggs", amount: 2, unit: "count" },
      { name: "baking soda", amount: 5, unit: "g" },
      { name: "salt", amount: 3, unit: "g" },
    ],
    instructions: [
      "Heat the oven to 175°C and line a loaf tin.",
      "Mash the bananas, then stir in the melted butter, sugar and eggs.",
      "Fold in the flour, baking soda and salt until just combined.",
      "Pour into the tin and bake for 60 minutes, until a skewer comes out clean.",
      "Cool in the tin for 10 minutes, then turn out onto a rack.",
    ],
  },
  {
    id: 2,
    name: "Chocolate Chip Cookies",
    category: "cookies",
    difficulty: "easy",
    prepTime: 20,
    bakeTime: 12,
    servings: 24,
    rating: 4.8,
    diet: ["vegetarian"],
    ingredients: [
      { name: "flour", amount: 280, unit: "g" },
      { name: "butter", amount: 225, unit: "g" },
      { name: "brown sugar", amount: 200, unit: "g" },
      { name: "sugar", amount: 100, unit: "g" },
      { name: "eggs", amount: 2, unit: "count" },
      { name: "chocolate chips", amount: 300, unit: "g" },
      { name: "baking soda", amount: 5, unit: "g" },
      { name: "salt", amount: 4, unit: "g" },
    ],
    instructions: [
      "Heat the oven to 190°C and line two baking trays.",
      "Beat the softened butter with both sugars until pale, then beat in the eggs.",
      "Mix in the flour, baking soda and salt, then stir in the chocolate chips.",
      "Scoop balls of dough onto the trays, leaving space between them.",
      "Bake for 12 minutes, until the edges are golden and the centres still soft.",
    ],
  },
  {
    id: 3,
    name: "Sourdough Loaf",
    category: "bread",
    difficulty: "hard",
    prepTime: 40, // hands-on time only; rising takes much longer (see steps)
    bakeTime: 45,
    servings: 12,
    rating: 4.2,
    diet: ["vegetarian", "vegan"],
    ingredients: [
      { name: "bread flour", amount: 500, unit: "g" },
      { name: "water", amount: 375, unit: "g" },
      { name: "sourdough starter", amount: 100, unit: "g" },
      { name: "salt", amount: 10, unit: "g" },
    ],
    instructions: [
      "Mix the flour and water and rest for 30 minutes.",
      "Add the starter and salt and mix until fully combined.",
      "Let the dough rise for 4 to 5 hours, stretching and folding it every 45 minutes for the first 3 hours.",
      "Shape into a tight round, place in a floured basket and refrigerate overnight.",
      "Heat the oven to 230°C with a lidded pot inside.",
      "Score the loaf, bake in the pot for 25 minutes with the lid on, then 20 minutes with it off.",
    ],
  },
  {
    id: 4,
    name: "Lemon Drizzle Cake",
    category: "cake",
    difficulty: "medium",
    prepTime: 20,
    bakeTime: 50,
    servings: 10,
    rating: 4.0,
    diet: ["vegetarian"],
    ingredients: [
      { name: "flour", amount: 225, unit: "g" },
      { name: "sugar", amount: 225, unit: "g" },
      { name: "butter", amount: 225, unit: "g" },
      { name: "eggs", amount: 4, unit: "count" },
      { name: "baking powder", amount: 10, unit: "g" },
      { name: "lemons", amount: 2, unit: "count" },
      { name: "icing sugar", amount: 85, unit: "g" },
    ],
    instructions: [
      "Heat the oven to 180°C and line a loaf tin.",
      "Beat the softened butter and sugar until pale, then beat in the eggs one at a time.",
      "Fold in the flour, baking powder and the zest of both lemons.",
      "Pour into the tin and bake for 50 minutes, until a skewer comes out clean.",
      "Mix the lemon juice with the icing sugar and pour it over the warm cake.",
    ],
  },
];

// Finds one recipe by its id, or returns undefined if there isn't one.
// Values from a URL are always text ("3"), so Number() converts first.
export function getRecipeById(id) {
  return recipes.find((recipe) => recipe.id === Number(id));
}

// Turns an ingredient's amount into display text:
// { name: "flour", amount: 250, unit: "g" } -> "250 g"
// { name: "eggs", amount: 2, unit: "count" } -> "2"
export function formatAmount(ingredient) {
  if (ingredient.unit === "count") {
    return `${ingredient.amount}`;
  }
  return `${ingredient.amount} ${ingredient.unit}`;
}
