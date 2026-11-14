"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { pans } from "@/lib/pans";
import { addSavedRecipe } from "@/lib/savedRecipes";

// "field" and "label" are our own classes from app/globals.css. The same
// pair is used on every input, so name them once.
const inputClass = "field mt-1";
const labelClass = "label block";

// What each choice in the Diet dropdown stores on the recipe.
// Vegan food is also vegetarian, so "vegan" stores both.
const dietChoices = {
  none: [],
  vegetarian: ["vegetarian"],
  vegan: ["vegetarian", "vegan"],
};

export default function AddRecipeForm() {
  const router = useRouter();

  // One state object holds all the simple fields. Inputs always give text,
  // so numbers are stored as text here and converted when saving.
  const [form, setForm] = useState({
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
  });

  // Ingredients are a list of rows the user can add to and remove from.
  // Each row has its own id so React can tell the rows apart.
  const [ingredients, setIngredients] = useState([
    { id: "first", name: "", amount: "", unit: "g" },
  ]);

  const [error, setError] = useState("");

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

  function handleSubmit(event) {
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

    const recipe = {
      // The current time in milliseconds: unique enough for an id, and far
      // above the built-in recipes' ids (1, 2, 3...).
      id: Date.now(),
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

    addSavedRecipe(recipe);
    // Go to the new recipe's page.
    router.push(`/recipes/${recipe.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="note tape space-y-4 px-4 pb-5 pt-7">
      {/* A "controlled" input: React state holds the value (value=...) and
          every keystroke updates the state (onChange=...). */}
      <label className={labelClass}>
        Name
        <input
          className={inputClass}
          name="name"
          value={form.name}
          onChange={handleChange}
          required
        />
      </label>

      <label className={labelClass}>
        Category
        <input
          className={inputClass}
          name="category"
          value={form.category}
          onChange={handleChange}
          placeholder="bread, cookies, cake…"
          required
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className={labelClass}>
          Difficulty
          <select
            className={inputClass}
            name="difficulty"
            value={form.difficulty}
            onChange={handleChange}
          >
            <option value="easy">easy</option>
            <option value="medium">medium</option>
            <option value="hard">hard</option>
          </select>
        </label>

        <label className={labelClass}>
          Diet
          <select
            className={inputClass}
            name="diet"
            value={form.diet}
            onChange={handleChange}
          >
            <option value="none">none</option>
            <option value="vegetarian">vegetarian</option>
            <option value="vegan">vegan</option>
          </select>
        </label>

        {/* type="number" with min/max lets the browser check the value
            before the form submits */}
        <label className={labelClass}>
          Prep time (minutes)
          <input
            className={inputClass}
            type="number"
            min="0"
            name="prepTime"
            value={form.prepTime}
            onChange={handleChange}
            required
          />
        </label>

        <label className={labelClass}>
          Bake time (minutes)
          <input
            className={inputClass}
            type="number"
            min="0"
            name="bakeTime"
            value={form.bakeTime}
            onChange={handleChange}
            required
          />
        </label>

        <label className={labelClass}>
          Servings
          <input
            className={inputClass}
            type="number"
            min="1"
            name="servings"
            value={form.servings}
            onChange={handleChange}
            required
          />
        </label>

        <label className={labelClass}>
          Pan
          <select
            className={inputClass}
            name="pan"
            value={form.pan}
            onChange={handleChange}
          >
            <option value="">no pan</option>
            {pans.map((pan) => (
              <option key={pan.id} value={pan.id}>
                {pan.label}
              </option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          Rating (1 to 5)
          <input
            className={inputClass}
            type="number"
            min="1"
            max="5"
            step="0.5"
            name="rating"
            value={form.rating}
            onChange={handleChange}
            required
          />
        </label>
      </div>

      {/* <fieldset> groups related fields; <legend> is the group's title */}
      <fieldset className="space-y-2">
        <legend className="label mb-1">Ingredients</legend>

        {ingredients.map((row) => (
          <div key={row.id} className="flex gap-2">
            {/* aria-label names the field for screen readers, since these
                inputs have no visible label of their own */}
            <input
              className="field min-w-0"
              aria-label="Ingredient name"
              placeholder="flour"
              value={row.name}
              onChange={(event) =>
                updateIngredient(row.id, "name", event.target.value)
              }
              required
            />
            <input
              className="field w-24 flex-none font-mono"
              aria-label="Amount"
              type="number"
              min="0"
              step="any"
              placeholder="250"
              value={row.amount}
              onChange={(event) =>
                updateIngredient(row.id, "amount", event.target.value)
              }
              required
            />
            <select
              className="field w-auto flex-none"
              aria-label="Unit"
              value={row.unit}
              onChange={(event) =>
                updateIngredient(row.id, "unit", event.target.value)
              }
            >
              <option value="g">g</option>
              <option value="count">count</option>
            </select>
            {/* type="button" stops the button from submitting the form.
                A recipe needs at least one ingredient, so the last row
                can't be removed. */}
            <button
              type="button"
              className="btn-quiet flex-none"
              aria-label="Remove ingredient"
              onClick={() => removeIngredient(row.id)}
              disabled={ingredients.length === 1}
            >
              ×
            </button>
          </div>
        ))}

        <button
          type="button"
          className="btn-quiet"
          onClick={addIngredient}
        >
          + Add ingredient
        </button>
      </fieldset>

      <label className={labelClass}>
        Instructions (one step per line)
        <textarea
          className={inputClass}
          name="instructions"
          rows="6"
          value={form.instructions}
          onChange={handleChange}
          required
        />
      </label>

      {/* role="alert" makes screen readers announce the message */}
      {error !== "" && (
        <p role="alert" className="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="btn"
      >
        Save recipe
      </button>
    </form>
  );
}
