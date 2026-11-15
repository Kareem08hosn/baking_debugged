// Server action: the bake debugger's plain-language explanation (Phase 5
// v3). The ranking itself is the rules engine; the AI only puts the top
// causes into words.
"use server";

import { generateJson } from "@/lib/ai/gemini";
import { runAiTask } from "@/lib/ai/run";
import { checkExplanation, explanationPrompt } from "@/lib/ai/tasks";
import { BAKE_TYPES, SYMPTOMS, diagnose } from "@/lib/debugger";

// Returns { result: { summary, tryFirst }, cached } or { error }.
export async function explainDiagnosis({ type, symptoms }) {
  // Check everything against the known lists: never trust the browser.
  const bakeType = BAKE_TYPES.find((item) => item.id === type);
  const known = SYMPTOMS[type] ?? [];
  const chosen = Array.isArray(symptoms)
    ? known.filter((item) => symptoms.includes(item.id))
    : [];
  if (!bakeType || chosen.length === 0) {
    return { error: "Choose what you baked and what went wrong first." };
  }

  // The diagnosis is worked out again here, on the server, from the rules.
  const causes = diagnose(type, chosen.map((item) => item.id)).slice(0, 3);

  return runAiTask({
    kind: "explanation",
    input: { type, symptoms: chosen.map((item) => item.id).sort() },
    ask: async () => {
      const answer = await generateJson(
        explanationPrompt({ typeLabel: bakeType.label, symptomLabels: chosen.map((item) => item.label), causes })
      );
      return checkExplanation(answer);
    },
  });
}
