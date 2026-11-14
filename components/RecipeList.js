// "use client" tells Next.js to run this component in the browser too.
// We need that because it reacts to the user (search, tabs, dropdowns).
"use client";

import { useState } from "react";
import RecipeCard from "@/components/RecipeCard";
import { useFavourites } from "@/lib/favourites";
import { useMyRecipes } from "@/lib/myRecipes";
import { usePreferences } from "@/lib/preferences";
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

// A magnifying glass drawn as a circle and a line.
function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5 L21 21" />
    </svg>
  );
}

// { recipes: builtInRecipes } pulls the "recipes" prop out of what page.js
// passed in and renames it, because the full list is built just below.
export default function RecipeList({ recipes: builtInRecipes }) {
  // The signed-in person's own recipes, from the database (lib/myRecipes.js).
  const myRecipes = useMyRecipes().recipes;
  // Recipes added before accounts existed live in this browser
  // (lib/savedRecipes.js). The hook gives null until they have loaded; ??
  // swaps that for an empty list. isLocal marks them as the person's own.
  const localRecipes = (useSavedRecipes() ?? []).map((recipe) => ({
    ...recipe,
    isLocal: true,
  }));
  // [...a, ...b, ...c] makes one new array holding everything from all three.
  const recipes = [...builtInRecipes, ...myRecipes, ...localRecipes];
  // Ids of the recipes saved with the Save button (lib/favourites.js)
  const favouriteIds = useFavourites().ids;

  // State = a value React remembers between redraws.
  // sortBy is the current value, setSortBy changes it and redraws the list.
  const [sortBy, setSortBy] = useState("name");

  // One piece of state per filter. "all" means "don't filter on this".
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  // null = not chosen here yet, so the saved preference is used
  const [chosenDiet, setDiet] = useState(null);
  const preferredDiet = usePreferences().diet;
  const diet = chosenDiet ?? preferredDiet;
  // What is typed in the search box
  const [searchText, setSearchText] = useState("");
  // How many recipes are currently shown
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const categories = uniqueValues(recipes.map((recipe) => recipe.category));
  // flatMap is map + flatten: each recipe has an ARRAY of diets,
  // and we want one flat list of them.
  // The diet in use is always an option, even if no recipe has it yet
  // (a "vegan" preference with no vegan recipes), so the dropdown can show it.
  const diets = uniqueValues([
    ...recipes.flatMap((recipe) => recipe.diet),
    ...(diet === "all" ? [] : [diet]),
  ]);

  // How many recipes each tab holds, shown as a small number on the tab.
  // filter(...).length counts the items that pass the test.
  function countIn(value) {
    if (value === "all") {
      return recipes.length;
    }
    return recipes.filter((recipe) => inTab(recipe, value)).length;
  }

  // Is this recipe in this tab? "saved" is a special tab for favourites;
  // every other tab is a category.
  function inTab(recipe, value) {
    if (value === "all") {
      return true;
    }
    if (value === "saved") {
      return favouriteIds.includes(recipe.id);
    }
    if (value === "mine") {
      return recipe.owner != null || recipe.isLocal === true;
    }
    return recipe.category === value;
  }

  // The "saved" tab only appears once something is saved (or while it is
  // the chosen tab, so it doesn't vanish under you after un-saving).
  const showSavedTab = favouriteIds.length > 0 || category === "saved";
  // Same for "mine": the person's own recipes
  const hasOwn = recipes.some((recipe) => inTab(recipe, "mine"));
  const showMineTab = hasOwn || category === "mine";
  const tabs = [
    "all",
    ...(showMineTab ? ["mine"] : []),
    ...(showSavedTab ? ["saved"] : []),
    ...categories,
  ];

  // filter() keeps only the recipes where the function returns true.
  // A recipe must pass every check (&& means AND, || means OR).
  const filteredRecipes = recipes.filter(
    (recipe) =>
      inTab(recipe, category) &&
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

  // True when anything narrows the list, so "Clear filters" is worth showing.
  const isFiltered =
    category !== "all" ||
    difficulty !== "all" ||
    diet !== "all" ||
    searchText.trim() !== "";

  // Any change to what is shown starts the list from the top again.
  // This takes a "setter" (like setCategory) and returns a new function
  // that calls it and resets the count: a function that makes functions.
  function changeFilter(setter) {
    return (value) => {
      setter(value);
      setVisibleCount(PAGE_SIZE);
    };
  }
  const chooseCategory = changeFilter(setCategory);
  const chooseDifficulty = changeFilter(setDifficulty);
  const chooseDiet = changeFilter(setDiet);
  const changeSearch = changeFilter(setSearchText);

  function clearFilters() {
    chooseCategory("all");
    chooseDifficulty("all");
    chooseDiet("all");
    changeSearch("");
  }

  return (
    <div>
      {/* type="search" gives the box a clear button and the right phone
          keyboard. The label is for screen readers only (sr-only); the
          placeholder alone isn't enough, it disappears once you type. */}
      <label className="relative mb-5 block max-w-xl">
        <span className="sr-only">Search recipes</span>
        <SearchIcon />
        <input
          className="field pl-10"
          type="search"
          placeholder="Search by name or ingredient"
          value={searchText}
          onChange={(event) => changeSearch(event.target.value)}
        />
      </label>

      {/* Category tabs. When they don't fit, the row scrolls sideways
          instead of wrapping (overflow-x-auto). On phones the negative
          margin lets it run to the screen edge. Below "lg" the right edge
          fades out (a mask), a hint that there are more tabs to scroll to.
          pt-1 leaves room for a tab lifting on hover. */}
      <div
        role="group"
        aria-label="Category"
        className="tab-row -mx-4 overflow-x-auto px-4 pt-1 [scrollbar-width:none] max-lg:[mask-image:linear-gradient(to_right,black_85%,transparent)] sm:mx-0 sm:px-0"
      >
        {/* "all" first, then "saved" if there is one, then one tab per
            category found in the data */}
        {tabs.map((value) => (
          <button
            key={value}
            type="button"
            className="tab"
            // A toggle button says whether it is on with aria-pressed
            aria-pressed={category === value}
            onClick={() => chooseCategory(value)}
          >
            {value}
            <small>{countIn(value)}</small>
          </button>
        ))}
      </div>

      {/* The filter strip, on the "page" the tabs belong to. The count on
          the left, the other controls on the right. */}
      <div className="note mb-9 flex flex-wrap items-center justify-between gap-x-5 gap-y-2.5 px-4 py-3 font-mono text-[0.8125rem]">
        {/* aria-live makes screen readers announce the new count when a
            filter changes */}
        <p aria-live="polite">
          <b className="tabular-nums">{sortedRecipes.length}</b> of{" "}
          {recipes.length} recipes
        </p>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <label>
            <span className="text-muted">level </span>
            <select
              className="field-inline"
              value={difficulty}
              onChange={(event) => chooseDifficulty(event.target.value)}
            >
              <option value="all">any</option>
              <option value="easy">easy</option>
              <option value="medium">medium</option>
              <option value="hard">hard</option>
            </select>
          </label>

          <label>
            <span className="text-muted">diet </span>
            <select
              className="field-inline"
              value={diet}
              onChange={(event) => chooseDiet(event.target.value)}
            >
              <option value="all">any</option>
              {diets.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="text-muted">sort by </span>
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

          {isFiltered && (
            <button type="button" className="underline underline-offset-4" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Empty state: say what happened and offer the way out. */}
      {sortedRecipes.length === 0 && (
        <div className="note note-ruled tape mx-auto max-w-md -rotate-1 px-5 pb-5 pt-8">
          <p className="font-mono text-lg font-bold leading-7">
            No recipes match
          </p>
          <p className="leading-7">
            Nothing fits{searchText.trim() && <> “{searchText.trim()}”</>} with
            these filters. Try fewer filters or a shorter search.
          </p>
          <button type="button" className="btn-quiet mt-3" onClick={clearFilters}>
            Clear filters
          </button>
        </div>
      )}

      {/* Recipe notes: 1 column on phones, 2 from "sm", 3 from "lg".
          Tailwind is mobile-first: plain classes apply everywhere, and a
          prefix like sm: means "from this screen width upwards". */}
      <ul className="grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
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
        <div className="mt-10 text-center">
          <button
            type="button"
            className="btn-paper"
            onClick={() => setVisibleCount(visibleCount + PAGE_SIZE)}
          >
            Show more ({sortedRecipes.length - visibleCount} left)
          </button>
        </div>
      )}
    </div>
  );
}
