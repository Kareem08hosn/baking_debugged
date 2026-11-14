import assert from "node:assert/strict";
import { test } from "node:test";
import { getTopic } from "./chemistry/topics.js";
import { SWAPS, findSwaps } from "./substitutions.js";

test("every swap is complete and links a real chemistry note", () => {
  for (const swap of SWAPS) {
    assert.ok(swap.to.length > 3, `${swap.id}.to`);
    for (const field of ["amount", "effect", "chemistry"]) {
      assert.ok(swap[field].length > 10, `${swap.id}.${field}`);
    }
    assert.ok(["well", "okay", "poorly"].includes(swap.works), swap.id);
    assert.ok(getTopic(swap.topic), swap.id);
  }
  assert.equal(new Set(SWAPS.map((swap) => swap.id)).size, SWAPS.length);
});

test("ingredients find their swaps, loosely but not too loosely", () => {
  assert.deepEqual(findSwaps("unsalted butter").map((s) => s.id), ["butter-to-oil"]);
  assert.deepEqual(findSwaps("Buttermilk").map((s) => s.id), ["buttermilk"]);
  assert.deepEqual(findSwaps("creamy peanut butter"), []);
  assert.deepEqual(findSwaps("large eggs").map((s) => s.id), ["egg-flax"]);
  assert.deepEqual(findSwaps(""), []);
});
