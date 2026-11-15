"use client";

import { useState } from "react";
import { findRecipes } from "@/app/find/actions";
import RecipeCard from "@/components/RecipeCard";

const EXAMPLES = [
  "something chewy with brown butter",
  "an easy loaf for a beginner",
  "lemony and light",
  "spiced, for breakfast",
];

// Describe a recipe in your own words; get matches with the reason each one
// fits. The server decides between smart search and keyword search.
export default function RecipeFinder() {
  const [text, setText] = useState("");
  const [answer, setAnswer] = useState(null); // the server's reply
  const [isSearching, setIsSearching] = useState(false);

  async function search(description) {
    setText(description);
    setIsSearching(true);
    setAnswer(await findRecipes(description));
    setIsSearching(false);
  }

  function handleSubmit(event) {
    event.preventDefault();
    search(text);
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="note tape panel">
        <label htmlFor="find-text" className="panel-title">
          What are you in the mood for?
        </label>
        <textarea
          id="find-text"
          className="field note-ruled mt-4 bg-[position:0_7px] leading-7"
          rows="2"
          maxLength={200}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            // Enter searches; Shift+Enter makes a new line
            if (event.key === "Enter" && !event.shiftKey) {
              handleSubmit(event);
            }
          }}
          placeholder="something chewy with brown butter"
        />
        <div className="mt-3 flex flex-wrap gap-1.5">
          {EXAMPLES.map((example) => (
            <button key={example} type="button" className="chip" onClick={() => search(example)}>
              {example}
            </button>
          ))}
        </div>
        <button type="submit" className="btn mt-5" disabled={text.trim().length < 3 || isSearching}>
          {isSearching ? "Looking…" : "Find recipes"}
        </button>
      </form>

      <div aria-live="polite" className="mt-10">
        {answer?.error && <p role="alert" className="alert">{answer.error}</p>}
        {answer && !answer.error && (
          <p className="font-mono text-sm text-muted">
            {answer.results.length} {answer.results.length === 1 ? "match" : "matches"}. {answer.note}
          </p>
        )}
      </div>

      {answer && !answer.error && answer.results.length === 0 && (
        <div className="note note-ruled tape mx-auto mt-6 max-w-md -rotate-1 px-5 pb-6 pt-8">
          <p className="font-mono text-lg font-bold leading-7">No matches</p>
          <p className="leading-7">Try naming an ingredient, a texture (chewy, flaky) or a kind of bake (loaf, muffins).</p>
        </div>
      )}

      {answer?.results?.length > 0 && (
        <ul className="mt-8 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {answer.results.map(({ recipe, reason }, index) => (
            <li key={recipe.id}>
              <RecipeCard recipe={recipe} position={index} />
              {reason && <p className="mt-3 px-1 text-sm">{reason}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
