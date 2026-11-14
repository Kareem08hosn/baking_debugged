// "use client" tells Next.js to run this component in the browser too.
// We need that because it reacts to the user (the sort dropdown).
"use client";

import { useState } from "react";

// "easy" < "medium" < "hard" isn't alphabetical, so give each one a number.
const difficultyOrder = { easy: 1, medium: 2, hard: 3 };

// A compare function tells sort which of two recipes comes first:
// negative -> a first, positive -> b first, 0 -> leave them as they are.
function compareRecipes(a, b, sortBy) {
  if (sortBy === "name") {
    return a.name.localeCompare(b.name); // alphabetical
  }
  if (sortBy === "bakeTime") {
    return a.bakeTime - b.bakeTime; // shortest first
  }
  if (sortBy === "difficulty") {
    return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]; // easiest first
  }
  if (sortBy === "rating") {
    return b.rating - a.rating; // highest first, so b and a are swapped
  }
  return 0;
}

// Builds the option list for a dropdown from the data itself, so a new
// category shows up automatically. A Set is a list that drops duplicates;
// [...set] turns it back into a normal array.
function uniqueValues(values) {
  return [...new Set(values)].toSorted();
}

// { recipes } pulls the "recipes" prop out of what page.js passed in.
export default function RecipeList({ recipes }) {
  // State = a value React remembers between redraws.
  // sortBy is the current value, setSortBy changes it and redraws the list.
  const [sortBy, setSortBy] = useState("name");

  // One piece of state per filter. "all" means "don't filter on this".
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [diet, setDiet] = useState("all");

  const categories = uniqueValues(recipes.map((recipe) => recipe.category));
  // flatMap is map + flatten: each recipe has an ARRAY of diets,
  // and we want one flat list of them.
  const diets = uniqueValues(recipes.flatMap((recipe) => recipe.diet));

  // filter() keeps only the recipes where the function returns true.
  // A recipe must pass all three checks (&& means AND, || means OR).
  const filteredRecipes = recipes.filter(
    (recipe) =>
      (category === "all" || recipe.category === category) &&
      (difficulty === "all" || recipe.difficulty === difficulty) &&
      (diet === "all" || recipe.diet.includes(diet))
  );

  // toSorted() returns a sorted COPY, so the original array stays untouched.
  const sortedRecipes = filteredRecipes.toSorted((a, b) =>
    compareRecipes(a, b, sortBy)
  );

  return (
    <div>
      {/* flex-wrap puts the dropdowns in a row and wraps them on small screens */}
      <div className="mb-4 flex flex-wrap gap-4">
        <label>
          Sort by{" "}
          <select
            className="rounded border p-1"
            value={sortBy}
            // Runs whenever the user picks an option; event.target is the <select>
            onChange={(event) => setSortBy(event.target.value)}
          >
            <option value="name">Name</option>
            <option value="bakeTime">Bake time</option>
            <option value="difficulty">Difficulty</option>
            <option value="rating">Rating</option>
          </select>
        </label>

        <label>
          Category{" "}
          <select
            className="rounded border p-1"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="all">All</option>
            {/* One <option> per category found in the data */}
            {categories.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <label>
          Difficulty{" "}
          <select
            className="rounded border p-1"
            value={difficulty}
            onChange={(event) => setDifficulty(event.target.value)}
          >
            <option value="all">All</option>
            <option value="easy">easy</option>
            <option value="medium">medium</option>
            <option value="hard">hard</option>
          </select>
        </label>

        <label>
          Diet{" "}
          <select
            className="rounded border p-1"
            value={diet}
            onChange={(event) => setDiet(event.target.value)}
          >
            <option value="all">All</option>
            {diets.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="mb-4 text-gray-500">
        Showing {sortedRecipes.length} of {recipes.length} recipes
      </p>

      <ul className="space-y-4">
        {/* .map() runs once per recipe and turns each one into an <li> */}
        {sortedRecipes.map((recipe) => (
          // key lets React tell the list items apart; it must be unique
          <li key={recipe.id} className="rounded-lg border p-4">
            <h2 className="text-xl font-semibold">{recipe.name}</h2>
            <p>
              {recipe.category} · {recipe.difficulty} · {recipe.bakeTime} min
            </p>
            <p>★ {recipe.rating}</p>
            {/* join() glues the ingredients array into one string */}
            <p className="text-sm text-gray-500">
              {recipe.ingredients.join(", ")}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
