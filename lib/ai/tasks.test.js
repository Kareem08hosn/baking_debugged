import assert from "node:assert/strict";
import { test } from "node:test";
import {
  checkExplanation,
  checkRerank,
  checkSubstitution,
  explanationPrompt,
  rerankPrompt,
  substitutionPrompt,
} from "./tasks.js";

test("substitution answers are checked strictly", () => {
  const result = checkSubstitution({
    substitutes: [
      { name: "Oil", amount: "80 g", works: "okay", effect: "Denser.", chemistry: "Pure fat." },
      { name: "Bad", amount: "x", works: "amazing", effect: "?" }, // not a real rating
      { name: "", amount: "1", works: "well", effect: "No name" },
      "junk",
    ],
    note: "  Tip  ",
  });
  assert.equal(result.substitutes.length, 1);
  assert.equal(result.substitutes[0].name, "Oil");
  assert.equal(result.note, "Tip");
  assert.deepEqual(checkSubstitution(null), { substitutes: [], note: "" });
});

test("the substitution prompt includes the recipe and known swaps", () => {
  const { prompt } = substitutionPrompt({
    ingredient: "butter",
    have: "oil",
    recipe: { name: "Muffins", ingredients: [{ name: "flour", amount: 250, unit: "g" }] },
    knownSwaps: [{ to: "Oil", amount: "80%" }],
  });
  assert.ok(prompt.includes("Muffins"));
  assert.ok(prompt.includes("flour 250 g"));
  assert.ok(prompt.includes("Oil (80%)"));
  assert.ok(prompt.includes("oil"));
});

test("explanations need both parts", () => {
  assert.deepEqual(checkExplanation({ summary: "It under-proofed.", tryFirst: "Rise longer." }), {
    summary: "It under-proofed.",
    tryFirst: "Rise longer.",
  });
  assert.equal(checkExplanation({ summary: "Only half" }), null);
  const { prompt } = explanationPrompt({
    typeLabel: "Bread",
    symptomLabels: ["Dense"],
    causes: [{ cause: "Under-proofed", likelihood: "Most likely", why: "w", reasons: ["Short rise."], fix: "f" }],
  });
  assert.ok(prompt.includes("Under-proofed (Most likely)"));
});

test("re-ranking keeps only offered ids, once each", () => {
  const matches = checkRerank(
    { matches: [{ id: 3, reason: "Chewy" }, { id: 99, reason: "Made up" }, { id: 3, reason: "Again" }, { id: "5", reason: "As text" }] },
    [3, 5, 7]
  );
  assert.deepEqual(matches, [{ id: 3, reason: "Chewy" }, { id: 5, reason: "As text" }]);
  const { prompt } = rerankPrompt({ query: "chewy", candidates: [{ id: 3, name: "Cookies", category: "cookies", difficulty: "easy", ingredients: [{ name: "brown sugar" }] }] });
  assert.ok(prompt.includes("id 3: Cookies"));
});
