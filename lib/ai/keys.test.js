import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeText, stableJson } from "./keys.js";

test("key order doesn't change the text", () => {
  assert.equal(stableJson({ b: 1, a: [2, { d: 3, c: 4 }] }), stableJson({ a: [2, { c: 4, d: 3 }], b: 1 }));
});

test("free text is tidied", () => {
  assert.equal(normalizeText("  Brown   Butter "), "brown butter");
  assert.equal(normalizeText(undefined), "");
});
