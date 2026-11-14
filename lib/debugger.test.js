// Tests for lib/debugger.js. Run with: npm test
import assert from "node:assert/strict";
import { test } from "node:test";
import { getTopic } from "./chemistry/topics.js";
import { BAKE_TYPES, RULES, SYMPTOMS, cleanDetails, detailsFor, diagnose } from "./debugger.js";

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

test("a short rise puts under-proofing first for dense bread", () => {
  const results = diagnose("bread", ["dense"], { riseHours: 1 });
  assert.equal(results[0].id, "bread-underproofed");
  assert.equal(results[0].likelihood, "Most likely");
  assert.ok(results[0].reasons.includes("The total rise was under 1½ hours."));
});

test("a long rise flips flat bread towards over-proofing", () => {
  const results = diagnose("bread", ["flat"], { riseHours: 6 });
  assert.equal(results[0].id, "bread-overproofed");
});

test("melted butter makes it the top cause of spreading cookies", () => {
  const results = diagnose("cookies", ["spread"], { butterState: "melted", doughChilled: "no" });
  const ids = results.slice(0, 2).map((result) => result.id);
  assert.ok(ids.includes("cookies-warm-butter"));
  assert.ok(ids.includes("cookies-not-chilled"));
});

test("answers can make a cause less likely", () => {
  const shut = diagnose("cake", ["sank"], { doorOpened: "no" }).find((r) => r.id === "cake-door-opened");
  const opened = diagnose("cake", ["sank"], { doorOpened: "yes" }).find((r) => r.id === "cake-door-opened");
  assert.ok(opened.score > shut.score);
  assert.equal(shut.likelihood, "Less likely");
});

test("a cause explaining two symptoms ranks higher", () => {
  const one = diagnose("bread", ["gummy"]).find((r) => r.id === "bread-underbaked");
  const two = diagnose("bread", ["gummy", "pale"]).find((r) => r.id === "bread-underbaked");
  assert.equal(two.score, one.score + 1);
});

test("nothing chosen, nothing found", () => {
  assert.deepEqual(diagnose("cake", []), []);
});

test("details are cleaned and filtered by bake type", () => {
  assert.deepEqual(cleanDetails({ riseHours: "2.5", kitchen: "", measuredBy: "cups" }), {
    riseHours: 2.5,
    measuredBy: "cups",
  });
  assert.ok(detailsFor("bread").some((d) => d.id === "hydrationPct"));
  assert.ok(!detailsFor("cookies").some((d) => d.id === "hydrationPct"));
});
