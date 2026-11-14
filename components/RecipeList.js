// "use client" tells Next.js to run this component in the browser too.
// We need that because it reacts to the user (the sort dropdown).
"use client";

import { useState } from "react";
import RecipeCard from "@/components/RecipeCard";
import { useSavedRecipes } from "@/lib/savedRecipes";

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
    // Highest first, so b and a are swapped. Recipes with no rating
    // (null); ?? 0 counts them as 0 so they go to the end.
    return (b.rating ?? 0) - (a.rating ?? 0);
  }
  return 0;
}

// Builds the option list for a dropdown from the data itself, so a new
// category shows up automatically. A Set is a list that drops duplicates;
// [...set] turns it back into a normal array.
function uniqueValues(values) {
  return [...new Set(values)].toSorted();
}

// How many recipes to show at first, and how many more each time the
// "Show more" button is pressed.
const PAGE_SIZE = 24;

// True if the recipe's name or any of its ingredients contains the search
// text. Both sides are lowercased so "Bread" finds "bread".
function matchesSearch(recipe, searchText) {
  const wanted = searchText.trim().toLowerCase();
  if (wanted === "") {
    return true;
  }
  return (
    recipe.name.toLowerCase().includes(wanted) ||
    recipe.ingredients.some((ingredient) =>
      ingredient.name.toLowerCase().includes(wanted)
    )
  );
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
  // What is typed in the search box
  const [searchText, setSearchText] = useState("");
  // How many recipes are currently shown
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

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
      (diet === "all" || recipe.diet.includes(diet)) &&
      matchesSearch(recipe, searchText)
  );

  // toSorted() returns a sorted COPY, so the original array stays untouched.
  const sortedRecipes = filteredRecipes.toSorted((a, b) =>
    compareRecipes(a, b, sortBy)
  );

  // slice(0, n) takes the first n items: only these are drawn.
  const visibleRecipes = sortedRecipes.slice(0, visibleCount);

  return (
    <div>
      {/* type="search" gives the box a clear button and the right phone
          keyboard. The label is for screen readers only (sr-only). */}
      <label className="mb-3 block">
        <span className="sr-only">Search recipes</span>
        <input
          className="field"
          type="search"
          placeholder="Search by name or ingredient…"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />
      </label>

      {/* Category filter: a row of chips. On a phone the row scrolls
          sideways instead of wrapping (overflow-x-auto), and the negative
          margin lets it run to the screen edge. */}
      <div
        role="group"
        aria-label="Category"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2.5 pt-0.5 [scrollbar-width:none]"
      >
        {/* "all" first, then one chip per category found in the data */}
        {["all", ...categories].map((value) => (
          <button
            key={value}
            type="button"
            // flex-none stops chips being squashed to fit the row
            className="chip flex-none"
            // A toggle button says whether it is on with aria-pressed
            aria-pressed={category === value}
            onClick={() => setCategory(value)}
          >
            {value}
          </button>
        ))}
      </div>

      {/* The count on the left, the other three controls on the right */}
      <div className="mb-6 mt-1 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 font-mono text-xs text-muted">
        {/* aria-live makes screen readers announce the new count when a
            filter changes */}
        <p aria-live="polite">
          {sortedRecipes.length} of {recipes.length} recipes
        </p>

        <div className="flex flex-wrap gap-x-4 gap-y-2">
          <label>
            level:{" "}
            <select
              className="field-inline"
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value)}
            >
              <option value="all">all</option>
              <option value="easy">easy</option>
              <option value="medium">medium</option>
              <option value="hard">hard</option>
            </select>
          </label>

          <label>
            diet:{" "}
            <select
              className="field-inline"
              value={diet}
              onChange={(event) => setDiet(event.target.value)}
            >
              <option value="all">all</option>
              {diets.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          <label>
            sort:{" "}
            <select
              className="field-inline"
              value={sortBy}
              // Runs whenever the user picks an option; event.target is the <select>
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option value="name">name</option>
              <option value="bakeTime">bake time</option>
              <option value="difficulty">difficulty</option>
              <option value="rating">rating</option>
            </select>
          </label>
        </div>
      </div>

      {/* && means "only show this if the left side is true" */}
      {sortedRecipes.length === 0 && (
        <p className="font-mono">Nothing matches those filters.</p>
      )}

      {/* Recipe notes: 1 column on phones, 2 from "sm", 3 from "lg".
          Tailwind is mobile-first: plain classes apply everywhere, and a
          prefix like sm: means "from this screen width upwards". */}
      <ul className="grid gap-x-5 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
        {/* .map() runs once per recipe and turns each one into an <li>.
            It also hands over each item's position in the list (index). */}
        {visibleRecipes.map((recipe, index) => (
          // key lets React tell the list items apart; it must be unique
          <li key={recipe.id}>
            <RecipeCard recipe={recipe} position={index} />
          </li>
        ))}
      </ul>

      {/* Only offered while some matching recipes are still hidden */}
      {visibleCount < sortedRecipes.length && (
        <div className="mt-8 text-center">
          <button
            type="button"
            className="btn-quiet"
            onClick={() => setVisibleCount(visibleCount + PAGE_SIZE)}
          >
            Show more ({sortedRecipes.length - visibleCount} left)
          </button>
        </div>
      )}
    </div>
  );
}
