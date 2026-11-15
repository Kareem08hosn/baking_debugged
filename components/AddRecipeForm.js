"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { pans } from "@/lib/pans";
import { createRecipe, updateRecipe } from "@/app/recipes/actions";

// "field" and "label" are our own classes from app/globals.css. The same
// pair is used on every input, so name them once.
const inputClass = "field mt-1";
const labelClass = "label block";
const numberClass = "field mt-1 font-mono text-lg font-bold tabular-nums";

// The heading of each part of the form: a number in a circle (the parts
// really are in order) and a title.
function FormStep({ number, title }) {
  return (
    <h2 className="flex items-center gap-3 panel-title">
      <span className="grid size-9 place-content-center rounded-full border-[1.5px] border-foreground text-base" aria-hidden="true">
        {number}
      </span>
      {title}
    </h2>
  );
}

// What each choice in the Diet dropdown stores on the recipe.
// Vegan food is also vegetarian, so "vegan" stores both.
const dietChoices = {
  none: [],
  vegetarian: ["vegetarian"],
  vegan: ["vegetarian", "vegan"],
};

// The form's starting values. Empty for a new recipe; for editing, the
// existing recipe turned back into form text (numbers become "250", the
// steps become one per line).
function initialForm(recipe) {
  if (!recipe) {
    return {
      name: "",
      category: "",
      difficulty: "easy",
      diet: "none",
      prepTime: "",
      bakeTime: "",
      servings: "",
      pan: "", // a pan id, or "" for no pan
      rating: "",
      instructions: "",
    };
  }
  return {
    name: recipe.name,
    category: recipe.category,
    difficulty: recipe.difficulty,
    // The opposite of dietChoices above: ["vegetarian", "vegan"] -> "vegan"
    diet: recipe.diet.includes("vegan")
      ? "vegan"
      : recipe.diet.includes("vegetarian")
        ? "vegetarian"
        : "none",
    prepTime: String(recipe.prepTime),
    bakeTime: String(recipe.bakeTime),
    servings: String(recipe.servings),
    pan: recipe.pan ?? "",
    rating: recipe.rating == null ? "" : String(recipe.rating),
    instructions: recipe.instructions.join("\n"),
  };
}

function initialIngredients(recipe) {
  if (!recipe) {
    return [{ id: "first", name: "", amount: "", unit: "g" }];
  }
  // The position makes a unique id for each existing row
  return recipe.ingredients.map((ingredient, index) => ({
    id: `row-${index}`,
    name: ingredient.name,
    amount: String(ingredient.amount),
    unit: ingredient.unit,
  }));
}

// The add-recipe form. Given a "recipe", it edits that recipe instead of
// adding a new one (used by /recipes/[id]/edit).
export default function AddRecipeForm({ recipe: existing = null }) {
  const router = useRouter();
  const isEditing = existing !== null;

  // One state object holds all the simple fields. Inputs always give text,
  // so numbers are stored as text here and converted when saving.
  // useState(() => ...) runs the function once, for the first value only.
  const [form, setForm] = useState(() => initialForm(existing));

  // Ingredients are a list of rows the user can add to and remove from.
  // Each row has its own id so React can tell the rows apart.
  const [ingredients, setIngredients] = useState(() => initialIngredients(existing));

  const [error, setError] = useState("");
  // True while the recipe is being saved, so the button can't be pressed twice
  const [isSaving, setIsSaving] = useState(false);

  // One function handles every simple field. Each input has a "name" that
  // matches a key in the form object.
  function handleChange(event) {
    // ...form copies the existing fields; [event.target.name] then replaces
    // just the one that changed (square brackets = use the variable as the key).
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function addIngredient() {
    setIngredients([
      ...ingredients,
      // randomUUID() gives a unique id for the new row
      { id: crypto.randomUUID(), name: "", amount: "", unit: "g" },
    ]);
  }

  function removeIngredient(id) {
    setIngredients(ingredients.filter((row) => row.id !== id));
  }

  // Replace one field of one row, leaving the other rows as they are.
  function updateIngredient(id, field, value) {
    setIngredients(
      ingredients.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  }

  // "async" because saving waits for the server.
  async function handleSubmit(event) {
    // By default a form reloads the page when submitted. Stop that so
    // JavaScript can handle it.
    event.preventDefault();

    // One step per line: split the text into lines, tidy each one, and
    // drop empty lines.
    const steps = form.instructions
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "");

    if (steps.length === 0) {
      setError("Add at least one instruction step.");
      return;
    }

    // No id: the database gives the recipe one when it is saved.
    const recipe = {
      name: form.name.trim(),
      category: form.category.trim().toLowerCase(),
      difficulty: form.difficulty,
      prepTime: Number(form.prepTime),
      bakeTime: Number(form.bakeTime),
      servings: Number(form.servings),
      // null means "not baked in a pan"
      pan: form.pan === "" ? null : form.pan,
      rating: Number(form.rating),
      diet: dietChoices[form.diet],
      // Keep name, amount and unit; the row id was only for the form.
      ingredients: ingredients.map((row) => ({
        name: row.name.trim(),
        amount: Number(row.amount),
        unit: row.unit,
      })),
      instructions: steps,
    };

    // Send it to the server action (app/recipes/actions.js), which checks
    // it again and saves it under the signed-in person's account.
    setError("");
    setIsSaving(true);
    const result = isEditing
      ? await updateRecipe(existing.id, recipe)
      : await createRecipe(recipe);
    if (result.error) {
      setError(result.error);
      setIsSaving(false);
      return;
    }
    // Go to the new recipe's page.
    router.push(`/recipes/${result.id}`);
  }

  return (
    // noValidate is NOT set, so the browser still checks required fields
    // and number limits before handleSubmit runs.
    <form onSubmit={handleSubmit} className="grid gap-10">
      {/* ---------- 1. Basics ---------- */}
      <fieldset className="note tape panel">
        {/* <fieldset> groups related fields; <legend> is the group's title */}
        <legend className="sr-only">Basics</legend>
        <FormStep number={1} title="Basics" />

        <div className="mt-5 grid gap-4">
          {/* A "controlled" input: React state holds the value (value=...)
              and every keystroke updates the state (onChange=...).
              htmlFor/id ties the label to its input. */}
          <div>
            <label htmlFor="recipe-name" className={labelClass}>Name</label>
            <input
              id="recipe-name"
              className={`${inputClass} font-mono text-lg font-bold`}
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Brown butter blondies"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="recipe-category" className={labelClass}>Category</label>
              <input
                id="recipe-category"
                className={inputClass}
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="bread, cookies, cake…"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="recipe-difficulty" className={labelClass}>Difficulty</label>
                <select id="recipe-difficulty" className={inputClass} name="difficulty" value={form.difficulty} onChange={handleChange}>
                  <option value="easy">easy</option>
                  <option value="medium">medium</option>
                  <option value="hard">hard</option>
                </select>
              </div>
              <div>
                <label htmlFor="recipe-diet" className={labelClass}>Diet</label>
                <select id="recipe-diet" className={inputClass} name="diet" value={form.diet} onChange={handleChange}>
                  <option value="none">none</option>
                  <option value="vegetarian">vegetarian</option>
                  <option value="vegan">vegan</option>
                </select>
              </div>
            </div>
          </div>

          {/* type="number" with min/max lets the browser check the value
              before the form submits */}
          <div className="graph grid grid-cols-2 gap-4 border-[1.5px] border-foreground p-3.5 sm:grid-cols-4">
            <div>
              <label htmlFor="recipe-prep" className={labelClass}>Prep (min)</label>
              <input id="recipe-prep" className={numberClass} type="number" min="0" inputMode="numeric" name="prepTime" value={form.prepTime} onChange={handleChange} required />
            </div>
            <div>
              <label htmlFor="recipe-bake" className={labelClass}>Bake (min)</label>
              <input id="recipe-bake" className={numberClass} type="number" min="0" inputMode="numeric" name="bakeTime" value={form.bakeTime} onChange={handleChange} required />
            </div>
            <div>
              <label htmlFor="recipe-servings" className={labelClass}>Makes / serves</label>
              <input id="recipe-servings" className={numberClass} type="number" min="1" inputMode="numeric" name="servings" value={form.servings} onChange={handleChange} required />
            </div>
            <div>
              <label htmlFor="recipe-rating" className={labelClass}>Your rating</label>
              <input id="recipe-rating" className={numberClass} type="number" min="1" max="5" step="0.5" inputMode="decimal" name="rating" value={form.rating} onChange={handleChange} placeholder="1–5" required />
            </div>
          </div>

          <div>
            <label htmlFor="recipe-pan" className={labelClass}>Pan</label>
            <select id="recipe-pan" className={inputClass} name="pan" value={form.pan} onChange={handleChange}>
              <option value="">no pan (cookies, free-form loaves…)</option>
              {pans.map((pan) => (
                <option key={pan.id} value={pan.id}>
                  {pan.label}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-sm text-muted">
              With a pan, the recipe page can rescale it to other pan sizes.
            </p>
          </div>
        </div>
      </fieldset>

      {/* ---------- 2. Ingredients ---------- */}
      <fieldset className="note tape panel">
        <legend className="sr-only">Ingredients</legend>
        <FormStep number={2} title="Ingredients" />
        <p className="mt-2 text-sm text-muted">
          In grams, or as a count for whole things like eggs.
        </p>

        <ul className="mt-4 grid gap-2">
          {ingredients.map((row, index) => (
            // On phones the name gets its own line (basis-full), and the
            // amount, unit and remove button share the next one.
            <li key={row.id} className="flex flex-wrap gap-2 border-b border-dashed border-line pb-2 last:border-b-0 sm:flex-nowrap sm:border-b-0 sm:pb-0">
              {/* aria-label names each field for screen readers, since these
                  inputs have no visible label of their own. The number says
                  which row it is. */}
              <input
                className="field min-w-0 basis-full sm:basis-auto"
                aria-label={`Ingredient ${index + 1} name`}
                placeholder="flour"
                value={row.name}
                onChange={(event) => updateIngredient(row.id, "name", event.target.value)}
                required
              />
              <input
                className="field w-auto min-w-0 flex-1 font-mono sm:w-22 sm:flex-none"
                aria-label={`Ingredient ${index + 1} amount`}
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                placeholder="250"
                value={row.amount}
                onChange={(event) => updateIngredient(row.id, "amount", event.target.value)}
                required
              />
              <select
                className="field w-auto flex-none font-mono"
                aria-label={`Ingredient ${index + 1} unit`}
                value={row.unit}
                onChange={(event) => updateIngredient(row.id, "unit", event.target.value)}
              >
                <option value="g">g</option>
                <option value="count">count</option>
              </select>
              {/* type="button" stops the button from submitting the form.
                  A recipe needs at least one ingredient, so the last row
                  can't be removed. */}
              <button
                type="button"
                className="btn-round flex-none self-center"
                aria-label={`Remove ${row.name.trim() || `ingredient ${index + 1}`}`}
                onClick={() => removeIngredient(row.id)}
                disabled={ingredients.length === 1}
              >
                <svg viewBox="0 0 20 20" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
                  <path d="M5 5 L15 15 M15 5 L5 15" />
                </svg>
              </button>
            </li>
          ))}
        </ul>

        <button type="button" className="btn-quiet mt-4" onClick={addIngredient}>
          + Add ingredient
        </button>
      </fieldset>

      {/* ---------- 3. Method ---------- */}
      <fieldset className="note tape panel">
        <legend className="sr-only">Method</legend>
        <FormStep number={3} title="Method" />
        <label htmlFor="recipe-instructions" className="mt-2 block text-sm text-muted">
          One step per line. Each line becomes a numbered step.
        </label>
        {/* Ruled paper: the 28px line height (leading-7) sits on the lines */}
        <textarea
          id="recipe-instructions"
          className="field note-ruled mt-3 bg-[position:0_7px] leading-7"
          name="instructions"
          rows="7"
          value={form.instructions}
          onChange={handleChange}
          placeholder={"Brown the butter and let it cool.\nWhisk in the sugar and eggs."}
          required
        />
      </fieldset>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <button type="submit" className="btn" disabled={isSaving}>
          {isSaving ? "Saving…" : isEditing ? "Save changes" : "Save recipe"}
        </button>
        <p className="hand -rotate-1 text-muted">only you can see it</p>
      </div>

      {/* role="alert" makes screen readers announce the message */}
      {error !== "" && (
        <p role="alert" className="alert">
          {error}
        </p>
      )}
    </form>
  );
}
