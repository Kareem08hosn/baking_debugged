// Tests for lib/debugger.js. Run with: npm test
import assert from "node:assert/strict";
import { test } from "node:test";
import { getTopic } from "./chemistry/topics.js";
import { BAKE_TYPES, RULES, SYMPTOMS, diagnose } from "./debugger.js";

test("every rule points at real symptoms and a real chemistry note", () => {
  for (const rule of RULES) {
    assert.ok(getTopic(rule.topic), `${rule.id}: unknown topic ${rule.topic}`);
    for (const symptom of rule.symptoms) {
      const known = rule.types.some((type) => SYMPTOMS[type].some((item) => item.id === symptom));
      assert.ok(known, `${rule.id}: unknown symptom ${symptom}`);
    }
  }
});

test("every symptom has at least one possible cause", () => {
  for (const { id: type } of BAKE_TYPES) {
    for (const symptom of SYMPTOMS[type]) {
      assert.ok(diagnose(type, [symptom.id]).length > 0, `${type}/${symptom.id} has no rule`);
    }
  }
});

test("rule ids are unique", () => {
  assert.equal(new Set(RULES.map((rule) => rule.id)).size, RULES.length);
});

test("a cause explaining two symptoms ranks higher", () => {
  const one = diagnose("bread", ["gummy"]).find((r) => r.id === "bread-underbaked");
  const two = diagnose("bread", ["gummy", "pale"]).find((r) => r.id === "bread-underbaked");
  assert.equal(two.score, one.score + 1);
  assert.ok(two.reasons.length > 0);
});

test("results come best first, with a likelihood label", () => {
  const results = diagnose("bread", ["dense", "no-rise"]);
  const scores = results.map((result) => result.score);
  assert.deepEqual(scores, scores.toSorted((a, b) => b - a));
  assert.ok(["Most likely", "Possible", "Less likely"].includes(results[0].likelihood));
});

test("nothing chosen, nothing found", () => {
  assert.deepEqual(diagnose("cake", []), []);
});
