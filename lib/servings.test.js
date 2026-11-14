// Tests for lib/servings.js. Run with: npm test
import assert from "node:assert/strict";
import { test } from "node:test";
import { yieldWord } from "./servings.js";

test("bakes that come out as pieces say makes", () => {
  assert.equal(yieldWord({ category: "cookies" }), "makes");
  assert.equal(yieldWord({ category: "muffins" }), "makes");
  assert.equal(yieldWord({ category: "buns" }), "makes");
});

test("bakes that are cut into portions say serves", () => {
  assert.equal(yieldWord({ category: "cake" }), "serves");
  assert.equal(yieldWord({ category: "bread" }), "serves");
  // a category someone typed that isn't on the list
  assert.equal(yieldWord({ category: "pudding" }), "serves");
});
