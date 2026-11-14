// The checks every AI request goes through, in order. SERVER ONLY.
//   1. AI switched on?        (both keys set; see lib/ai/config.js)
//   2. Signed in?             (limits are per person)
//   3. Already answered?      (the shared cache: no API call, no limit used)
//   4. Under today's limit?
//   5. Ask Gemini, check the answer, cache it.
import { getUser } from "@/lib/supabase/server";
import { DAILY_LIMIT, isAiEnabled } from "./config.js";
import { getCached, setCached, takeOneRequest } from "./store.js";

// kind:  "substitution", "explanation" or "search" (the cache's label)
// input: the question, exactly as it should be matched in the cache
// ask:   a function that calls Gemini and returns a checked answer, or null
//        if there's no usable answer (which isn't cached)
// Returns { result, cached } or { error, off } (off = AI not switched on).
export async function runAiTask({ kind, input, ask }) {
  if (!isAiEnabled()) {
    return { off: true, error: "The AI features aren’t switched on yet." };
  }
  const user = await getUser();
  if (!user) {
    return { error: "Sign in to use the AI features. It keeps them free by limiting requests per person." };
  }

  const cached = await getCached(kind, input);
  if (cached) {
    return { result: cached, cached: true };
  }

  if (!(await takeOneRequest(user.id))) {
    return { error: `You’ve used today’s ${DAILY_LIMIT} AI requests. They reset at midnight (UTC).` };
  }

  try {
    const result = await ask();
    if (result) {
      await setCached(kind, input, result);
    }
    return { result, cached: false };
  } catch (error) {
    // The details (status codes, API messages) stay in the server log.
    console.error(`AI task "${kind}" failed:`, error.message);
    return { error: "The AI couldn’t answer just now. Try again in a minute." };
  }
}
