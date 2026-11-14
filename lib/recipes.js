// Hardcoded recipe data for now. Later (Phase 3) this moves into a database.
// It has its own file so several pages can share it. "export" makes it
// importable from other files (like "public" in Java).
export const recipes = [
  {
    id: 1,
    name: "Banana Bread",
    category: "bread",
    difficulty: "easy",
    bakeTime: 60, // minutes, stored as a number so we can sort by it later
    ingredients: ["bananas", "flour", "sugar", "butter", "eggs", "baking soda"],
    rating: 4.5, // out of 5
    diet: ["vegetarian"],
  },
  {
    id: 2,
    name: "Chocolate Chip Cookies",
    category: "cookies",
    difficulty: "easy",
    bakeTime: 12,
    ingredients: ["flour", "butter", "brown sugar", "eggs", "chocolate chips"],
    rating: 4.8,
    diet: ["vegetarian"],
  },
  {
    id: 3,
    name: "Sourdough Loaf",
    category: "bread",
    difficulty: "hard",
    bakeTime: 45,
    ingredients: ["bread flour", "water", "sourdough starter", "salt"],
    rating: 4.2,
    diet: ["vegetarian", "vegan"], // every diet this recipe fits (vegan food is also vegetarian)
  },
  {
    id: 4,
    name: "Lemon Drizzle Cake",
    category: "cake",
    difficulty: "medium",
    bakeTime: 50,
    ingredients: ["flour", "sugar", "butter", "eggs", "lemons"],
    rating: 4.0,
    diet: ["vegetarian"],
  },
];
