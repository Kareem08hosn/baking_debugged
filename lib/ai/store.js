// The AI answer cache and daily limits, both in the database and both
// written only by the server with the secret key (lib/supabase/admin.js).
// SERVER ONLY.
import { createHash } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { DAILY_LIMIT, TEXT_MODEL } from "./config.js";
import { stableJson } from "./keys.js";

// A short fingerprint of a question: the same question always gives the
// same key, so its answer can be looked up. sha256 is a standard hash.
export function cacheKey(input) {
  return createHash("sha256").update(stableJson(input)).digest("hex");
}

// The cached answer for a question, or null.
export async function getCached(kind, input) {
  const { data, error } = await createAdminClient()
    .from("ai_cache")
    .select("output")
    .eq("kind", kind)
    .eq("cache_key", cacheKey(input))
    .maybeSingle();
  if (error) {
    console.error("Reading the AI cache failed:", error.message);
    return null; // carry on without the cache
  }
  return data?.output ?? null;
}

// Saves an answer. A failure here isn't worth bothering the person with.
export async function setCached(kind, input, output) {
  const { error } = await createAdminClient()
    .from("ai_cache")
    .upsert({ kind, cache_key: cacheKey(input), input, output, model: TEXT_MODEL });
  if (error) {
    console.error("Writing the AI cache failed:", error.message);
  }
}

// Counts one AI request for this person today. (Not called "use...":
// names starting with "use" are reserved for React hooks.) Returns false (and counts
// nothing) if they've reached the daily limit.
export async function takeOneRequest(userId) {
  const admin = createAdminClient();
  const today = new Date().toISOString().slice(0, 10); // UTC day, "2026-11-14"
  const { data } = await admin
    .from("ai_usage")
    .select("count")
    .eq("user_id", userId)
    .eq("day", today)
    .maybeSingle();
  const used = data?.count ?? 0;
  if (used >= DAILY_LIMIT) {
    return false;
  }
  // Two requests at the very same moment could both read the same count;
  // for a daily limit on a small site, that's close enough.
  await admin.from("ai_usage").upsert({ user_id: userId, day: today, count: used + 1 });
  return true;
}
