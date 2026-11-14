// Server action: find recipes from a description (Phase 6).
// Smart search (when the AI is on and you're signed in): the description is
// turned into an embedding, pgvector finds the closest recipes, and Gemini
// picks the best of those and says why. Otherwise: keyword search.
"use server";

import { isAiEnabled } from "@/lib/ai/config";
import { embedTexts, generateJson, queryText } from "@/lib/ai/gemini";
import { normalizeText } from "@/lib/ai/keys";
import { runAiTask } from "@/lib/ai/run";
import { checkRerank, rerankPrompt } from "@/lib/ai/tasks";
import { keywordSearch } from "@/lib/describeSearch";
import { getRecipes } from "@/lib/recipes";
import { supabase } from "@/lib/supabase/public";
import { getUser } from "@/lib/supabase/server";

// Returns { mode: "smart" | "keywords", results: [{ recipe, reason }], note }
// or { error }.
export async function findRecipes(description) {
  const query = normalizeText(description);
  if (query.length < 3 || query.length > 200) {
    return { error: "Describe it in a few words (up to 200 characters)." };
  }
  const recipes = await getRecipes();

  function keywords(note) {
    const results = keywordSearch(recipes, query).map(({ recipe, reason }) => ({ recipe, reason }));
    return { mode: "keywords", results, note };
  }

  if (!isAiEnabled()) {
    return keywords("Keyword match. Smart search switches on soon.");
  }
  if (!(await getUser())) {
    return keywords("Keyword match. Sign in for smart search.");
  }

  const run = await runAiTask({
    kind: "search",
    input: { query },
    ask: async () => {
      const [vector] = await embedTexts([queryText(query)]);
      // match_recipes is the database function in supabase/add-ai.sql
      const { data, error } = await supabase.rpc("match_recipes", { query_embedding: vector, match_count: 10 });
      if (error) {
        throw new Error(`match_recipes: ${error.message}`);
      }
      if (data.length === 0) {
        return null; // no embeddings yet (run: npm run embed)
      }
      const candidates = data.map((row) => recipes.find((recipe) => recipe.id === row.recipe_id)).filter(Boolean);
      const answer = await generateJson(rerankPrompt({ query, candidates }));
      const matches = checkRerank(answer, candidates.map((recipe) => recipe.id));
      // If the re-ranking gave nothing usable, keep the embedding order.
      return { matches: matches.length > 0 ? matches : candidates.slice(0, 6).map((recipe) => ({ id: recipe.id, reason: "" })) };
    },
  });

  if (run.error || !run.result) {
    return keywords(run.error ? `Keyword match. ${run.error}` : "Keyword match. Smart search isn’t ready yet.");
  }
  const results = run.result.matches
    .map((match) => ({ recipe: recipes.find((recipe) => recipe.id === match.id), reason: match.reason }))
    .filter((item) => item.recipe);
  return { mode: "smart", results, note: run.cached ? "Smart match (saved answer)." : "Smart match." };
}
