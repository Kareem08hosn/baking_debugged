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

// { recipes } pulls the "recipes" prop out of what page.js passed in.
export default function RecipeList({ recipes }) {
  // State = a value React remembers between redraws.
  // sortBy is the current value, setSortBy changes it and redraws the list.
  const [sortBy, setSortBy] = useState("name");

  // toSorted() returns a sorted COPY, so the original array stays untouched.
  const sortedRecipes = recipes.toSorted((a, b) =>
    compareRecipes(a, b, sortBy)
  );

  return (
    <div>
      <label className="mb-4 block">
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
