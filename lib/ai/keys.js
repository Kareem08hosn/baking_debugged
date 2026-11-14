// Turning questions into cache keys. No database, no secrets: tested.

// JSON with the object keys sorted, so { a, b } and { b, a } give the same
// text (and so the same cache key).
export function stableJson(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableJson).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const keys = Object.keys(value).sort();
    return `{${keys.map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value ?? null);
}

// Tidies free text so trivial differences don't miss the cache:
// "  Butter " and "butter" are the same question.
export function normalizeText(text) {
  return String(text ?? "").toLowerCase().replace(/\s+/g, " ").trim();
}
