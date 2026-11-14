// Tests for lib/ai/gemini.js, with a fake fetch (no key, no network).
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildEmbedRequest,
  buildGenerateRequest,
  embedTexts,
  generateJson,
  readGenerateResponse,
} from "./gemini.js";

test("the generate request asks for JSON with the schema", () => {
  const body = buildGenerateRequest({ system: "Be brief.", prompt: "Hi", schema: { type: "object" } });
  assert.equal(body.systemInstruction.parts[0].text, "Be brief.");
  assert.equal(body.contents[0].parts[0].text, "Hi");
  assert.deepEqual(body.generationConfig.responseFormat.text.schema, { type: "object" });
});

test("JSON answers are read, with or without code fences", () => {
  const wrap = (text) => ({ candidates: [{ content: { parts: [{ text }] } }] });
  assert.deepEqual(readGenerateResponse(wrap('{"a":1}')), { a: 1 });
  assert.deepEqual(readGenerateResponse(wrap('```json\n{"a":1}\n```')), { a: 1 });
  assert.throws(() => readGenerateResponse({ candidates: [{ finishReason: "SAFETY" }] }), /SAFETY/);
});

test("embedding requests ask for 768 dimensions per text", () => {
  const body = buildEmbedRequest(["a", "b"]);
  assert.equal(body.requests.length, 2);
  assert.equal(body.requests[1].output_dimensionality, 768);
});

test("calls send the key in a header and fail clearly without one", async () => {
  delete process.env.GEMINI_API_KEY;
  await assert.rejects(generateJson({ system: "", prompt: "", schema: {} }, async () => {}), /GEMINI_API_KEY/);

  process.env.GEMINI_API_KEY = "test-key";
  let seen;
  const fakeFetch = async (url, options) => {
    seen = { url, options };
    return { ok: true, json: async () => ({ embeddings: [{ values: [0.1, 0.2] }] }) };
  };
  const vectors = await embedTexts(["flour"], fakeFetch);
  assert.deepEqual(vectors, [[0.1, 0.2]]);
  assert.equal(seen.options.headers["x-goog-api-key"], "test-key");
  assert.ok(!seen.url.includes("test-key")); // never in the URL
  delete process.env.GEMINI_API_KEY;
});

test("API errors are thrown with the status", async () => {
  process.env.GEMINI_API_KEY = "test-key";
  const failing = async () => ({ ok: false, status: 429, text: async () => "quota" });
  await assert.rejects(generateJson({ system: "", prompt: "", schema: {} }, failing), /429/);
  delete process.env.GEMINI_API_KEY;
});
