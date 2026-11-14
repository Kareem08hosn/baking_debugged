// Tests for lib/altitude.js. Run with: npm test
import assert from "node:assert/strict";
import { test } from "node:test";
import { adjust, bandFor, boilingPointC, feetToMeters, middle } from "./altitude.js";

test("no band below about 900 m", () => {
  assert.equal(bandFor(0), null);
  assert.equal(bandFor(899), null);
});

test("each altitude falls in the right band", () => {
  assert.equal(bandFor(900).id, "900");
  assert.equal(bandFor(1600).id, "1500");
  assert.equal(bandFor(3000).id, "2100");
  assert.equal(bandFor(feetToMeters(5280)).id, "1500"); // Denver, one mile up
});

test("water boils lower higher up", () => {
  assert.equal(boilingPointC(0), 100);
  assert.equal(boilingPointC(1500), 95);
  assert.equal(boilingPointC(-50), 100);
});

test("percentages adjust gram amounts", () => {
  assert.equal(adjust(200, -6), 188);
  assert.equal(adjust(240, 12.5), 270);
  assert.equal(middle([6, 12.5]), 9.3);
});
