// "use client" tells Next.js to run this component in the browser too.
// We need that because it reacts to the user (the sort dropdown).
"use client";

import { useState } from "react";
// Link is Next.js's version of <a>: it changes page without a full reload.
import Link from "next/link";
import { useSavedRecipes } from "@/lib/savedRecipes";

// The same Tailwind classes are used on every dropdown, so name them once.
const labelClass = "block font-mono text-xs uppercase tracking-wide text-muted";
const selectClass =
  "mt-1 block w-full rounded border border-line bg-surface p-2 font-sans text-base normal-case tracking-normal text-foreground";

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

// { recipes: builtInRecipes } pulls the "recipes" prop out of what page.js
// passed in and renames it, because the full list is built just below.
export default function RecipeList({ recipes: builtInRecipes }) {
  // Recipes added through the form live in the browser (see lib/savedRecipes.js).
  // The hook gives null until they have loaded; ?? swaps that for an empty list.
  const savedRecipes = useSavedRecipes() ?? [];
  // [...a, ...b] makes one new array holding everything from both.
  const recipes = [...builtInRecipes, ...savedRecipes];

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
      {/* A grid with 2 columns on phones and 4 from the "sm" width up.
          Tailwind is mobile-first: plain classes apply everywhere, and a
          prefix like sm: means "from this screen width upwards". */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <label className={labelClass}>
          Sort by
          <select
            className={selectClass}
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

        <label className={labelClass}>
          Category
          <select
            className={selectClass}
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

        <label className={labelClass}>
          Difficulty
          <select
            className={selectClass}
            value={difficulty}
            onChange={(event) => setDifficulty(event.target.value)}
          >
            <option value="all">All</option>
            <option value="easy">easy</option>
            <option value="medium">medium</option>
            <option value="hard">hard</option>
          </select>
        </label>

        <label className={labelClass}>
          Diet
          <select
            className={selectClass}
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

      <p className="mb-4 font-mono text-sm text-muted">
        Showing {sortedRecipes.length} of {recipes.length} recipes
      </p>

      {/* && means "only show this if the left side is true" */}
      {sortedRecipes.length === 0 && <p>No recipes match these filters.</p>}

      {/* Recipe cards: 1 column on phones, 2 from "sm", 3 from "lg" */}
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* .map() runs once per recipe and turns each one into an <li> */}
        {sortedRecipes.map((recipe) => (
          // key lets React tell the list items apart; it must be unique
          <li key={recipe.id}>
            {/* The whole card is the link. Backticks make a template string:
                ${...} drops a value in, so recipe 3 links to "/recipes/3".
                h-full makes every card in a row the same height. */}
            <Link
              href={`/recipes/${recipe.id}`}
              className="block h-full rounded-lg border border-line bg-surface p-4 hover:border-foreground"
            >
              <p className="font-mono text-xs uppercase tracking-wide text-muted">
                {recipe.category} · {recipe.difficulty}
              </p>
              <h2 className="mt-1 font-mono text-xl font-bold">{recipe.name}</h2>
              <p className="mt-2 font-mono text-sm">
                {recipe.bakeTime} min bake · ★ {recipe.rating}
              </p>
              {/* Each ingredient is an object, so pull out just the names
                  first; join() then glues them into one string.
                  line-clamp-2 cuts the text off after two lines. */}
              <p className="mt-2 line-clamp-2 text-sm text-muted">
                {recipe.ingredients
                  .map((ingredient) => ingredient.name)
                  .join(", ")}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
