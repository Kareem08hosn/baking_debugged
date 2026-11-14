// Tests for lib/safeNext.js. Run with: npm test
import assert from "node:assert/strict";
import { test } from "node:test";
import { safeNextPath } from "./safeNext.js";

test("local paths are kept", () => {
  assert.equal(safeNextPath("/bakes"), "/bakes");
  assert.equal(safeNextPath("/recipes/12?x=1"), "/recipes/12?x=1");
});

test("anything that could leave the site becomes the homepage", () => {
  for (const value of ["https://evil.example", "//evil.example", "/\\evil.example", "evil", "", null, undefined, 42]) {
    assert.equal(safeNextPath(value), "/", String(value));
  }
});

test("the sign-in pages themselves are skipped", () => {
  assert.equal(safeNextPath("/login"), "/");
  assert.equal(safeNextPath("/login?error=link"), "/");
  assert.equal(safeNextPath("/auth/confirm"), "/");
});
