// Settings for the AI features. Everything comes from environment
// variables, which live in .env.local (on this computer) or the hosting
// settings, never in the code and never with a NEXT_PUBLIC_ name: these
// must stay on the server.
//
//   GEMINI_API_KEY        the Gemini key (Google AI Studio)
//   SUPABASE_SECRET_KEY   Supabase's secret key, for the AI cache and the
//                         daily limits (tables nobody else may write to)
//   GEMINI_MODEL          optional, the text model
//   GEMINI_EMBED_MODEL    optional, the embedding model
//   AI_DAILY_LIMIT        optional, AI requests per person per day
//
// Relative imports only in lib/ai/, so Node can run these files directly
// (tests and scripts/embed-recipes.mjs), not just Next.js.

// Defaults checked against Google's model list in November 2026: a stable
// Flash-Lite model (cheap, on the free tier) and the current embedding model.
export const TEXT_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
export const EMBED_MODEL = process.env.GEMINI_EMBED_MODEL || "gemini-embedding-2";

// Embedding size. Must match vector(768) in supabase/add-ai.sql.
export const EMBED_DIMENSIONS = 768;

export const DAILY_LIMIT = Number(process.env.AI_DAILY_LIMIT) || 25;

// True when both keys are set. Until then, the AI features show a "not
// switched on yet" state instead of failing.
export function isAiEnabled() {
  return Boolean(process.env.GEMINI_API_KEY && process.env.SUPABASE_SECRET_KEY);
}
