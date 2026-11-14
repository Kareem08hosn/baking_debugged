"use client";

import { useState } from "react";
import RecipeCard from "@/components/RecipeCard";
import { BASICS, matchRecipes } from "@/lib/pantry";

// Quick picks: tapping one adds it to the pantry.
const SUGGESTIONS = [
  "bread flour", "instant yeast", "brown sugar", "chocolate chips", "bananas",
  "oats", "cinnamon", "lemon", "buttermilk", "cocoa", "honey", "walnuts",
  "sourdough starter", "cream cheese", "apples",
];

// Type what you have; see what you can bake. "recipes" is the site's list.
export default function PantrySearch({ recipes }) {
  const [items, setItems] = useState([]);
  const [text, setText] = useState("");
  const [useBasics, setUseBasics] = useState(true);

  function add(value) {
    const item = value.trim().toLowerCase();
    if (item !== "" && !items.includes(item)) {
      setItems([...items, item]);
    }
    setText("");
  }

  function remove(item) {
    setItems(items.filter((existing) => existing !== item));
  }

  // Enter or a comma adds what's typed; Backspace in an empty box removes
  // the last item, like most tag inputs.
  function handleKeyDown(event) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      add(text);
    } else if (event.key === "Backspace" && text === "" && items.length > 0) {
      remove(items.at(-1));
    }
  }

  const results = matchRecipes(recipes, items, { useBasics });
  const ready = results.filter((result) => result.missing.length === 0);
  const almost = results.filter((result) => result.missing.length > 0);

  return (
    <div>
      <div className="note tape px-4 pb-5 pt-8 sm:px-6">
        <label htmlFor="pantry-input" className="font-mono text-2xl font-extrabold tracking-tight">
          What’s in your kitchen?
        </label>
        <p className="mt-1 text-sm text-muted">Type an ingredient and press Enter.</p>

        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-md border-[1.5px] border-foreground bg-surface p-2">
          {items.map((item) => (
            <span key={item} className="chip gap-1 bg-foreground text-background">
              {item}
              <button
                type="button"
                className="-mr-1.5 grid size-6 place-content-center rounded-full hover:bg-background hover:text-foreground"
                aria-label={`Remove ${item}`}
                onClick={() => remove(item)}
              >
                <svg viewBox="0 0 20 20" className="size-3" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" aria-hidden="true">
                  <path d="M5 5 L15 15 M15 5 L5 15" />
                </svg>
              </button>
            </span>
          ))}
          <input
            id="pantry-input"
            className="min-w-40 flex-1 bg-transparent px-1.5 py-1.5 text-base outline-none"
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={items.length === 0 ? "bananas, oats, brown sugar…" : "add another"}
            autoComplete="off"
          />
        </div>

        <div className="mt-4">
          <p className="label">Quick add</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {SUGGESTIONS.filter((item) => !items.includes(item)).map((item) => (
              <button key={item} type="button" className="chip" onClick={() => add(item)}>
                + {item}
              </button>
            ))}
          </div>
        </div>

        <label className="mt-5 flex items-start gap-2.5">
          <input
            type="checkbox"
            className="mt-1 size-4 accent-[var(--foreground)]"
            checked={useBasics}
            onChange={(event) => setUseBasics(event.target.checked)}
          />
          <span>
            I have the basics
            <span className="block text-sm text-muted">{BASICS.join(", ")}</span>
          </span>
        </label>
      </div>

      {/* ---------- Results ---------- */}
      <p aria-live="polite" className="mt-10 font-mono text-sm text-muted">
        {items.length === 0
          ? "Add what you have to see what you can bake."
          : `${ready.length} ready to bake, ${almost.length} missing three or fewer.`}
      </p>

      {items.length > 0 && results.length === 0 && (
        <div className="note note-ruled tape mx-auto mt-6 max-w-md -rotate-1 px-5 pb-6 pt-8">
          <p className="font-mono text-lg font-bold leading-7">Nothing fits yet</p>
          <p className="leading-7">
            No recipe uses these with three or fewer extra ingredients. Add a
            few more things, or tick “I have the basics”.
          </p>
        </div>
      )}

      {ready.length > 0 && <ResultGroup title="Ready to bake" results={ready} />}
      {almost.length > 0 && <ResultGroup title="Missing a few things" results={almost.slice(0, 24)} />}
    </div>
  );
}

// One group of matching recipes, each card with what's missing under it.
function ResultGroup({ title, results }) {
  return (
    <section className="mt-16">
      <h2 className="section-title">
        <span className="highlight">{title}</span>
      </h2>
      {/* gap-y-14: room for the "Missing" line plus the next card's tape */}
      <ul className="mt-8 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((result, index) => (
          <li key={result.recipe.id}>
            <RecipeCard recipe={result.recipe} position={index} />
            <p className="mt-3 px-1 text-sm">
              {result.missing.length === 0 ? (
                <span className="font-mono font-bold">You have everything.</span>
              ) : (
                <>
                  <span className="font-mono font-bold">Missing: </span>
                  {result.missing.join(", ")}
                </>
              )}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
