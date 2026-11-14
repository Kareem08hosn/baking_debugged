"use client";

import { useState } from "react";
import Link from "next/link";
import { askSubstitution } from "@/app/substitutions/actions";
import SwapCard from "@/components/ai/SwapCard";
import { findSwaps } from "@/lib/substitutions";

// Find a substitute for an ingredient. The notebook's swaps show straight
// away; "Ask the AI" covers anything else (once the AI is switched on).
//   aiEnabled          from the server: are the AI keys set?
//   recipe             { id, name, ingredients } when coming from a recipe
//   initialIngredient  from ?ingredient=
export default function SubstitutionFinder({ aiEnabled, recipe = null, initialIngredient = "" }) {
  const [ingredient, setIngredient] = useState(initialIngredient);
  const [have, setHave] = useState("");
  const [showChemistry, setShowChemistry] = useState(true);
  // The AI's answer, and the question it answered (so a new question
  // doesn't show an old answer)
  const [ai, setAi] = useState(null); // { question, result } or { question, error }
  const [isAsking, setIsAsking] = useState(false);

  const question = `${ingredient.trim().toLowerCase()}|${have.trim().toLowerCase()}`;
  const swaps = findSwaps(ingredient);
  const aiForThis = ai && ai.question === question ? ai : null;

  async function handleAsk(event) {
    event.preventDefault();
    setIsAsking(true);
    const response = await askSubstitution({ ingredient, have, recipeId: recipe?.id ?? null });
    setAi({ question, ...response });
    setIsAsking(false);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-start">
      <form onSubmit={handleAsk} className="note tape grid gap-4 px-4 pb-5 pt-8 sm:px-6">
        {recipe && (
          <div>
            <p className="label">From {recipe.name}: tap an ingredient</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {recipe.ingredients.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  className="chip"
                  aria-pressed={ingredient === item.name}
                  onClick={() => setIngredient(item.name)}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        )}
        <div>
          <label htmlFor="swap-ingredient" className="label block">Ingredient to replace</label>
          <input
            id="swap-ingredient"
            className="field mt-1 font-mono text-lg font-bold"
            value={ingredient}
            maxLength={60}
            onChange={(event) => setIngredient(event.target.value)}
            placeholder="buttermilk"
            autoComplete="off"
          />
        </div>
        <div>
          <label htmlFor="swap-have" className="label block">What you have instead (optional)</label>
          <input
            id="swap-have"
            className="field mt-1"
            value={have}
            maxLength={60}
            onChange={(event) => setHave(event.target.value)}
            placeholder="yogurt"
            autoComplete="off"
          />
        </div>
        <label className="flex items-center gap-2.5">
          <input
            type="checkbox"
            className="size-4 accent-[var(--foreground)]"
            checked={showChemistry}
            onChange={(event) => setShowChemistry(event.target.checked)}
          />
          <span className="font-mono font-bold">Chemistry mode</span>
          <span className="text-sm text-muted">show why each swap works or fails</span>
        </label>

        <div className="border-t border-dashed border-line pt-4">
          {aiEnabled ? (
            <>
              <button type="submit" className="btn" disabled={ingredient.trim().length < 2 || isAsking}>
                {isAsking ? "Asking…" : "Ask the AI"}
              </button>
              <p className="mt-2 text-xs text-muted">
                Your question goes to Google’s Gemini. <Link href="/privacy" className="underline">Privacy</Link>
              </p>
            </>
          ) : (
            <p className="text-sm text-muted">
              AI suggestions for anything not in the notebook are coming soon.
            </p>
          )}
        </div>
      </form>

      <section aria-labelledby="swaps-heading">
        <h2 id="swaps-heading" className="section-title">
          <span className="highlight">Swaps</span>
        </h2>
        <p aria-live="polite" className="mt-3 font-mono text-sm text-muted">
          {ingredient.trim() === ""
            ? "Type an ingredient to see what can replace it."
            : `${swaps.length} from the notebook${aiForThis?.result ? `, ${aiForThis.result.substitutes.length} from the AI` : ""}.`}
        </p>

        {swaps.length > 0 && (
          <ul className="mt-6 grid gap-5">
            {swaps.map((swap) => (
              <SwapCard key={swap.id} swap={swap} showChemistry={showChemistry} source="notebook" />
            ))}
          </ul>
        )}

        {ingredient.trim() !== "" && swaps.length === 0 && !aiForThis && (
          <div className="graph sheet mt-6 px-5 pb-6 pt-8">
            <p className="font-mono font-bold">Not in the notebook yet</p>
            <p className="mt-1.5">
              {aiEnabled
                ? "Ask the AI for suggestions, with the chemistry behind each one."
                : "The notebook covers the common swaps. AI suggestions for the rest are coming soon."}
            </p>
          </div>
        )}

        {aiForThis?.error && (
          <p role="alert" className="alert mt-6">{aiForThis.error}</p>
        )}
        {aiForThis?.result && (
          <>
            <h3 className="mt-10 font-mono text-xl font-bold">From the AI</h3>
            {aiForThis.result.substitutes.length > 0 ? (
              <ul className="mt-4 grid gap-5">
                {aiForThis.result.substitutes.map((swap) => (
                  <SwapCard key={swap.name} swap={swap} showChemistry={showChemistry} source="ai" />
                ))}
              </ul>
            ) : null}
            {aiForThis.result.note && <p className="mt-4">{aiForThis.result.note}</p>}
            <p className="mt-3 text-sm text-muted">
              AI suggestions can be wrong. Try a swap on a small batch first.
            </p>
          </>
        )}
      </section>
    </div>
  );
}
