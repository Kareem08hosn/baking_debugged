// Bakes: the fields of a bake log entry, checking them, pre-filling them
// from a recipe, and summing up a log. No React, no database: tested in
// lib/bakes.test.js. The table is in supabase/add-bakes-notes-preferences.sql.
import { hydration, showsHydration } from "./scaler.js";

// Every field of a bake except the recipe link. One list drives the form,
// the log table, the CSV export and the CSV import:
//   key     the name in JavaScript (camelCase)
//   column  the database column (snake_case)
//   type    "date", "text" or "number"
//   csv     column headings that mean this field in an imported spreadsheet
export const BAKE_FIELDS = [
  { key: "bakedOn", column: "baked_on", label: "Date", type: "date", csv: ["date", "baked on", "day"] },
  { key: "title", column: "title", label: "What you baked", type: "text", max: 120, required: true, csv: ["recipe", "title", "bake", "what", "name"] },
  { key: "rating", column: "rating", label: "Rating", unit: "/ 5", type: "number", min: 1, max: 5, csv: ["rating", "rating 1-5", "rating (1-5)", "score", "stars"] },
  { key: "flourG", column: "flour_g", label: "Flour", unit: "g", type: "number", min: 0, max: 100000, csv: ["flour g", "flour", "flour (g)"] },
  { key: "waterG", column: "water_g", label: "Water", unit: "g", type: "number", min: 0, max: 100000, csv: ["water g", "water", "water (g)", "liquid"] },
  { key: "sugarG", column: "sugar_g", label: "Sugar", unit: "g", type: "number", min: 0, max: 100000, csv: ["sugar g", "sugar", "sugar (g)"] },
  { key: "fatG", column: "fat_g", label: "Fat", unit: "g", type: "number", min: 0, max: 100000, csv: ["fat g", "fat", "fat (g)", "butter"] },
  { key: "leavener", column: "leavener", label: "Leavener", type: "text", max: 80, csv: ["leavener", "leavening", "raising agent", "yeast"] },
  { key: "hydrationPct", column: "hydration_pct", label: "Hydration", unit: "%", type: "number", min: 0, max: 300, csv: ["hydration %", "hydration", "hydration pct", "hydration (%)"] },
  { key: "ovenTempC", column: "oven_temp_c", label: "Oven", unit: "°C", type: "number", min: 0, max: 400, csv: ["oven temp", "oven temp c", "oven", "temp", "temperature", "oven temperature"] },
  { key: "bakeTimeMin", column: "bake_time_min", label: "Bake time", unit: "min", type: "number", min: 0, max: 1440, csv: ["bake time", "bake time min", "time", "bake time (min)"] },
  { key: "rise", column: "rise", label: "Rise / spread", type: "text", max: 200, csv: ["rise/spread", "rise / spread", "rise", "spread", "rise spread"] },
  { key: "texture", column: "texture", label: "Texture", type: "text", max: 200, csv: ["texture", "crumb"] },
  { key: "whatWentWrong", column: "what_went_wrong", label: "What went wrong", type: "text", max: 2000, csv: ["what went wrong", "problems", "issues", "went wrong"] },
  { key: "notes", column: "notes", label: "Notes", type: "text", max: 2000, csv: ["notes", "note", "comments"] },
];

// Today as "YYYY-MM-DD" in the visitor's own time zone. (toISOString would
// give the date in London time, which is already tomorrow on a Montreal
// evening.) padStart adds a leading zero: 3 -> "03".
export function today(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Reads a number out of text that may carry a unit: "500 g", "75%",
// "220°C", "1,000". Returns null for empty text, NaN if there's no number.
export function readNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  if (typeof value === "number") {
    return value;
  }
  const text = String(value).replace(/,/g, "").trim();
  if (text === "") {
    return null;
  }
  // A regular expression: an optional minus, digits, optionally a dot and
  // more digits. match() finds the first place the pattern appears.
  const found = text.match(/-?\d+(\.\d+)?/);
  return found ? Number(found[0]) : NaN;
}

// True for a real calendar date written YYYY-MM-DD (or with slashes).
function readDate(value) {
  const text = String(value ?? "").trim().replace(/\//g, "-");
  const found = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!found) {
    return null;
  }
  const [, year, month, day] = found.map(Number);
  // new Date quietly turns 31 February into 3 March, so check it stayed put.
  const date = new Date(year, month - 1, day);
  const isReal = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  if (!isReal || year < 2000 || year > 2100) {
    return null;
  }
  return today(date);
}

// Checks one bake (from the form or one spreadsheet row; values may be
// text or numbers). Returns { bake } with clean values (empty -> null), or
// { error: "message" } for the first problem.
export function validateBake(input) {
  if (typeof input !== "object" || input === null) {
    return { error: "The bake is missing." };
  }
  const bake = {};
  for (const field of BAKE_FIELDS) {
    const raw = input[field.key];
    const isEmpty = raw === null || raw === undefined || String(raw).trim() === "";

    if (field.type === "date") {
      if (isEmpty) {
        bake.bakedOn = today();
        continue;
      }
      const date = readDate(raw);
      if (!date) {
        return { error: `Write the date as YYYY-MM-DD (got “${raw}”).` };
      }
      bake.bakedOn = date;
    } else if (field.type === "number") {
      const number = readNumber(raw);
      if (number !== null && !(number >= field.min && number <= field.max)) {
        return { error: `${field.label} must be a number from ${field.min} to ${field.max} (got “${raw}”).` };
      }
      bake[field.key] = number;
    } else {
      const text = isEmpty ? "" : String(raw).trim();
      if (field.required && text === "") {
        return { error: `Say what you baked.` };
      }
      if (text.length > field.max) {
        return { error: `${field.label} can be up to ${field.max} characters.` };
      }
      bake[field.key] = text === "" ? null : text;
    }
  }

  const recipeId = input.recipeId;
  if (recipeId !== null && recipeId !== undefined && recipeId !== "") {
    if (!Number.isInteger(Number(recipeId))) {
      return { error: "That recipe doesn’t exist." };
    }
    bake.recipeId = Number(recipeId);
  } else {
    bake.recipeId = null;
  }
  return { bake };
}

// Bake object -> database columns (user_id is filled in by the database).
export function toBakeRow(bake) {
  const row = { recipe_id: bake.recipeId };
  for (const field of BAKE_FIELDS) {
    row[field.column] = bake[field.key];
  }
  return row;
}

// Database row -> bake object.
export function fromBakeRow(row) {
  const bake = { id: row.id, recipeId: row.recipe_id };
  for (const field of BAKE_FIELDS) {
    const value = row[field.column];
    // numeric columns can arrive as text from the database: make them numbers
    bake[field.key] = field.type === "number" && value !== null ? Number(value) : value;
  }
  return bake;
}

// Adds up the grams of every ingredient whose name passes a test.
function sumGrams(recipe, test) {
  return recipe.ingredients
    .filter((ingredient) => ingredient.unit === "g" && test(ingredient.name.toLowerCase()))
    .reduce((total, ingredient) => total + ingredient.amount, 0);
}

// The first oven temperature written in the steps, e.g. "Heat the oven to
// 200°C" -> 200. Returns null if there isn't one.
export function ovenTempFromSteps(steps = []) {
  for (const step of steps) {
    const found = step.match(/(\d{2,3})\s*°\s*C/);
    if (found) {
      return Number(found[1]);
    }
  }
  return null;
}

// A bake pre-filled from a recipe, so logging one is mostly done already.
// Starters are half flour, half water (see lib/scaler.js). "Fat" counts the
// weight of butter, oil and shortening; "sugar" counts sugars and syrups.
export function bakeFromRecipe(recipe) {
  const flour =
    sumGrams(recipe, (name) => name.includes("flour")) +
    sumGrams(recipe, (name) => name.includes("starter")) * 0.5;
  const recipeHydration = hydration(recipe);
  const leaveners = recipe.ingredients
    .map((ingredient) => ingredient.name.toLowerCase())
    .filter((name) => /yeast|baking soda|baking powder|starter/.test(name))
    .map((name) => name.split(",")[0].trim()); // "yeast, instant" -> "yeast"

  return {
    recipeId: recipe.id,
    title: recipe.name,
    flourG: flour > 0 ? Math.round(flour) : null,
    waterG: flour > 0 && recipeHydration > 0 ? Math.round((flour * recipeHydration) / 100) : null,
    sugarG: Math.round(sumGrams(recipe, (name) => /sugar|honey|syrup|molasses/.test(name))) || null,
    // \b is a word edge, so "butter" matches "butter, melted" but not
    // "buttermilk"; peanut butter is left out on purpose.
    fatG:
      Math.round(
        sumGrams(recipe, (name) => /\bbutter\b|\boil\b|shortening|lard/.test(name) && !name.includes("peanut"))
      ) || null,
    // [...new Set(list)] drops duplicates
    leavener: leaveners.length > 0 ? [...new Set(leaveners)].join(", ") : null,
    hydrationPct: showsHydration(recipe) ? recipeHydration : null,
    ovenTempC: ovenTempFromSteps(recipe.instructions),
    bakeTimeMin: recipe.bakeTime > 0 ? recipe.bakeTime : null,
  };
}

// Sums up a list of bakes for the top of the log.
export function summarizeBakes(bakes) {
  const rated = bakes.filter((bake) => bake.rating !== null);
  const averageRating =
    rated.length > 0
      ? Math.round((rated.reduce((total, bake) => total + bake.rating, 0) / rated.length) * 10) / 10
      : null;

  // Count bakes per title and keep the biggest.
  const counts = new Map();
  for (const bake of bakes) {
    counts.set(bake.title, (counts.get(bake.title) ?? 0) + 1);
  }
  let mostBaked = null;
  for (const [title, count] of counts) {
    if (!mostBaked || count > mostBaked.count) {
      mostBaked = { title, count };
    }
  }

  // Dates written YYYY-MM-DD sort correctly as plain text.
  const lastBakedOn = bakes.map((bake) => bake.bakedOn).toSorted().at(-1) ?? null;

  return { count: bakes.length, averageRating, mostBaked, lastBakedOn };
}
