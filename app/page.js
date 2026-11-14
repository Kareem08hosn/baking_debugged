import RecipeList from "./RecipeList";

// Hardcoded recipe data for now. Later (Phase 3) this moves into a database.
// It lives outside the component because it never changes while the page runs.
const recipes = [
  {
    id: 1,
    name: "Banana Bread",
    category: "bread",
    difficulty: "easy",
    bakeTime: 60, // minutes, stored as a number so we can sort by it later
    ingredients: ["bananas", "flour", "sugar", "butter", "eggs", "baking soda"],
    rating: 4.5, // out of 5
  },
  {
    id: 2,
    name: "Chocolate Chip Cookies",
    category: "cookies",
    difficulty: "easy",
    bakeTime: 12,
    ingredients: ["flour", "butter", "brown sugar", "eggs", "chocolate chips"],
    rating: 4.8,
  },
  {
    id: 3,
    name: "Sourdough Loaf",
    category: "bread",
    difficulty: "hard",
    bakeTime: 45,
    ingredients: ["bread flour", "water", "sourdough starter", "salt"],
    rating: 4.2,
  },
  {
    id: 4,
    name: "Lemon Drizzle Cake",
    category: "cake",
    difficulty: "medium",
    bakeTime: 50,
    ingredients: ["flour", "sugar", "butter", "eggs", "lemons"],
    rating: 4.0,
  },
];

export default function Home() {
  return (
    // className is JSX's word for the HTML "class" attribute.
    // These are Tailwind classes: each one applies a single CSS rule.
    <main className="mx-auto w-full max-w-2xl p-6">
      <h1 className="text-3xl font-bold">Baking Debugged</h1>
      {/* Curly braces switch from HTML-like JSX back to JavaScript */}
      <p className="mb-6 text-gray-500">{recipes.length} recipes</p>

      {/* Hand the data to RecipeList as a "prop" (like a function argument) */}
      <RecipeList recipes={recipes} />
    </main>
  );
}
