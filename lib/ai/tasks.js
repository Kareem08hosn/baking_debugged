// The three AI tasks: what to ask Gemini, the shape its answer must have
// (a JSON Schema), and a strict check of the answer it gives. No network,
// no secrets: tested in lib/ai/tasks.test.js.
//
// Gemini's answers are treated like anything else from outside: checked,
// trimmed to sensible lengths, and anything unexpected dropped. They are
// only ever shown as plain text (React escapes it), never as HTML.

const WORKS = ["well", "okay", "poorly"];

// A string trimmed and cut to a maximum length, or "" if it isn't one.
function cleanText(value, max) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

// Shared instructions: who the model is and the house style.
const HOUSE_STYLE =
  "You are the baking chemist behind Baking Debugged, a site for home bakers. " +
  "Be accurate and plain-spoken, use grams and degrees Celsius, and keep every field to one or two short sentences. " +
  "If you are not sure, say so rather than guess. Only discuss baking.";

// ---------------------------------------------------------------------------
// 1. Substitutions
// ---------------------------------------------------------------------------
export const SUBSTITUTION_SCHEMA = {
  type: "object",
  properties: {
    substitutes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string", description: "What to use instead" },
          amount: { type: "string", description: "How much, in grams, relative to the original" },
          works: { type: "string", enum: WORKS },
          effect: { type: "string", description: "How the bake will turn out differently" },
          chemistry: { type: "string", description: "Why, in terms of baking chemistry" },
        },
        required: ["name", "amount", "works", "effect", "chemistry"],
      },
    },
    note: { type: "string", description: "One overall tip, or why nothing works" },
  },
  required: ["substitutes", "note"],
};

// recipe: { name, ingredients } for context, or null.
// knownSwaps: the notebook's own swaps for this ingredient, so the answer agrees.
export function substitutionPrompt({ ingredient, have, recipe, knownSwaps }) {
  const lines = [
    `Ingredient to replace: ${ingredient}`,
    have ? `What the baker has instead (consider this first): ${have}` : "",
    recipe
      ? `It is for this recipe: ${recipe.name}. Ingredients: ${recipe.ingredients
          .map((item) => `${item.name} ${item.amount}${item.unit === "g" ? " g" : ""}`)
          .join(", ")}.`
      : "No specific recipe.",
    knownSwaps.length > 0
      ? `The site already recommends: ${knownSwaps.map((swap) => `${swap.to} (${swap.amount})`).join("; ")}. Stay consistent with these.`
      : "",
    "Give up to 3 substitutes, best first. Rate honestly: say 'poorly' when a swap will clearly change the bake. " +
      "If it isn't a real baking ingredient, return no substitutes and explain in the note.",
  ];
  return {
    system: HOUSE_STYLE,
    prompt: lines.filter(Boolean).join("\n"),
    schema: SUBSTITUTION_SCHEMA,
  };
}

// Checks a substitution answer. Returns { substitutes, note }.
export function checkSubstitution(answer) {
  const substitutes = (Array.isArray(answer?.substitutes) ? answer.substitutes : [])
    .map((item) => ({
      name: cleanText(item?.name, 80),
      amount: cleanText(item?.amount, 300),
      works: WORKS.includes(item?.works) ? item.works : null,
      effect: cleanText(item?.effect, 400),
      chemistry: cleanText(item?.chemistry, 500),
    }))
    .filter((item) => item.name && item.amount && item.works && item.effect)
    .slice(0, 3);
  return { substitutes, note: cleanText(answer?.note, 400) };
}

// ---------------------------------------------------------------------------
// 2. Plain-language explanation for the bake debugger (Phase 5 v3)
// ---------------------------------------------------------------------------
export const EXPLANATION_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string", description: "What most likely happened, in plain words, 2 to 4 sentences" },
    tryFirst: { type: "string", description: "The single change to make on the next bake" },
  },
  required: ["summary", "tryFirst"],
};

// causes: the top results of diagnose() in lib/debugger.js. The model is
// told to explain THESE, not invent new causes.
export function explanationPrompt({ typeLabel, symptomLabels, causes }) {
  const listed = causes
    .map((cause, index) => `${index + 1}. ${cause.cause} (${cause.likelihood}). Why: ${cause.why} Evidence: ${cause.reasons.join(" ") || "none given"} Fix: ${cause.fix}`)
    .join("\n");
  return {
    system: `${HOUSE_STYLE} You explain the result of a rules-based bake debugger. Only use the causes you are given; do not add new ones.`,
    prompt: [
      `Bake: ${typeLabel}`,
      `What went wrong: ${symptomLabels.join(", ")}`,
      "The debugger ranked these causes:",
      listed,
      "Write a short, friendly explanation of what most likely happened, connecting the symptoms to the top cause, and the one thing to change first.",
    ].join("\n"),
    schema: EXPLANATION_SCHEMA,
  };
}

export function checkExplanation(answer) {
  const summary = cleanText(answer?.summary, 900);
  const tryFirst = cleanText(answer?.tryFirst, 300);
  return summary && tryFirst ? { summary, tryFirst } : null;
}

// ---------------------------------------------------------------------------
// 3. Re-ranking recipe search results
// ---------------------------------------------------------------------------
export const RERANK_SCHEMA = {
  type: "object",
  properties: {
    matches: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "integer", description: "The recipe id from the list" },
          reason: { type: "string", description: "Why it fits the description, one short sentence" },
        },
        required: ["id", "reason"],
      },
    },
  },
  required: ["matches"],
};

// candidates: recipes found by the embedding search.
export function rerankPrompt({ query, candidates }) {
  const listed = candidates
    .map((recipe) => `id ${recipe.id}: ${recipe.name} (${recipe.category}, ${recipe.difficulty}); ingredients: ${recipe.ingredients.map((item) => item.name).join(", ")}`)
    .join("\n");
  return {
    system: `${HOUSE_STYLE} You pick recipes from a list. Only use ids from the list.`,
    prompt: `A baker is looking for: "${query}"\n\nRecipes:\n${listed}\n\nReturn the best matches (up to 6), best first, each with a short reason. Leave out recipes that don't fit.`,
    schema: RERANK_SCHEMA,
  };
}

// Keeps only ids that were actually offered, once each, in order.
export function checkRerank(answer, candidateIds) {
  const allowed = new Set(candidateIds);
  const seen = new Set();
  const matches = [];
  for (const item of Array.isArray(answer?.matches) ? answer.matches : []) {
    const id = Number(item?.id);
    if (allowed.has(id) && !seen.has(id)) {
      seen.add(id);
      matches.push({ id, reason: cleanText(item?.reason, 200) });
    }
  }
  return matches.slice(0, 6);
}
