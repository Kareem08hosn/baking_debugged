// Talking to the Gemini API with plain fetch (no SDK to install).
// SERVER ONLY: it reads GEMINI_API_KEY. Never import it from a client
// component.
//
// The request/response shapes follow Google's REST docs for
// generateContent and embedContent as of November 2026. They are built and
// read by small separate functions (tested in gemini.test.js) so that if
// the first real call shows a difference, only these need changing.
import { EMBED_DIMENSIONS, EMBED_MODEL, TEXT_MODEL } from "./config.js";

const API = "https://generativelanguage.googleapis.com/v1beta";

// Give up on a call after this long, so a slow API can't hang a page.
const TIMEOUT_MS = 20000;

// The body for a generateContent call that must answer with JSON matching
// "schema" (a JSON Schema object).
export function buildGenerateRequest({ system, prompt, schema }) {
  return {
    systemInstruction: { parts: [{ text: system }] },
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      responseFormat: {
        text: { mimeType: "APPLICATION_JSON", schema },
      },
    },
  };
}

// Pulls the JSON answer out of a generateContent response. Throws if
// there isn't one (for example when the answer was blocked).
export function readGenerateResponse(data) {
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  const text = parts.map((part) => part.text ?? "").join("").trim();
  if (text === "") {
    const reason = data?.candidates?.[0]?.finishReason ?? data?.promptFeedback?.blockReason ?? "empty";
    throw new Error(`Gemini returned no answer (${reason})`);
  }
  // Models sometimes wrap JSON in ```json fences even when asked not to.
  const json = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  return JSON.parse(json);
}

// The body for embedding several texts at once.
export function buildEmbedRequest(texts) {
  return {
    requests: texts.map((text) => ({
      model: `models/${EMBED_MODEL}`,
      content: { parts: [{ text }] },
      output_dimensionality: EMBED_DIMENSIONS,
    })),
  };
}

// The vectors out of a batchEmbedContents response, one per text.
export function readEmbedResponse(data, expected) {
  const vectors = (data?.embeddings ?? []).map((item) => item.values);
  if (vectors.length !== expected || vectors.some((vector) => !Array.isArray(vector))) {
    throw new Error("Gemini returned an unexpected embedding response");
  }
  return vectors;
}

// gemini-embedding-2 takes the task as part of the text, not as a setting.
export function queryText(query) {
  return `task: search result | query: ${query}`;
}
export function documentText(title, text) {
  return `title: ${title} | text: ${text}`;
}

// One POST to the API, with the key in a header (never in the URL, where
// it would end up in logs). fetchImpl lets tests pass a fake fetch.
async function post(path, body, fetchImpl) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  const response = await fetchImpl(`${API}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify(body),
    // AbortSignal.timeout cancels the request if it takes too long
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) {
    // The body explains what went wrong; it goes to the server log only.
    const detail = await response.text().catch(() => "");
    throw new Error(`Gemini ${response.status}: ${detail.slice(0, 300)}`);
  }
  return response.json();
}

// Asks the text model a question and returns its JSON answer.
export async function generateJson({ system, prompt, schema }, fetchImpl = fetch) {
  const data = await post(`models/${TEXT_MODEL}:generateContent`, buildGenerateRequest({ system, prompt, schema }), fetchImpl);
  return readGenerateResponse(data);
}

// Embeds a list of texts. Returns one vector (array of numbers) per text.
export async function embedTexts(texts, fetchImpl = fetch) {
  const data = await post(`models/${EMBED_MODEL}:batchEmbedContents`, buildEmbedRequest(texts), fetchImpl);
  return readEmbedResponse(data, texts.length);
}
