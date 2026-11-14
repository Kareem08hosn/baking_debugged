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
  },
  {
    id: 2,
    name: "Chocolate Chip Cookies",
    category: "cookies",
    difficulty: "easy",
    bakeTime: 12,
    ingredients: ["flour", "butter", "brown sugar", "eggs", "chocolate chips"],
  },
  {
    id: 3,
    name: "Sourdough Loaf",
    category: "bread",
    difficulty: "hard",
    bakeTime: 45,
    ingredients: ["bread flour", "water", "sourdough starter", "salt"],
  },
  {
    id: 4,
    name: "Lemon Drizzle Cake",
    category: "cake",
    difficulty: "medium",
    bakeTime: 50,
    ingredients: ["flour", "sugar", "butter", "eggs", "lemons"],
  },
];

export default function Home() {
  return (
    <main>
      <h1>Baking Debugged</h1>
      {/* Curly braces switch from HTML-like JSX back to JavaScript */}
      <p>{recipes.length} recipes</p>
    </main>
  );
}
