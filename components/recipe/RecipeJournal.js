"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createBake } from "@/app/bakes/actions";
import { averageRating, bakeFromRecipe, fromBakeRow, today } from "@/lib/bakes";
import { createClient } from "@/lib/supabase/client";

// Ratings offered in the quick form: 1, 1.5, 2 ... 5
const RATINGS = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

// "Your notebook" under a recipe: log that you made it, see your past bakes
// of it, and keep a private note. Everything here is the signed-in person's
// own data, loaded in the browser after the page appears.
export default function RecipeJournal({ recipe }) {
  // undefined = still loading, null = signed out, otherwise the data
  const [journal, setJournal] = useState(undefined);
  // "Reload" counter: changing it makes the effect below fetch again.
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    let ignore = false;

    async function load() {
      // getSession reads the sign-in cookie in the browser. Fine for
      // deciding what to SHOW; the database's policies do the protecting.
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        if (!ignore) setJournal(null);
        return;
      }
      // Two requests at once: Promise.all waits for both.
      const [bakes, note] = await Promise.all([
        supabase
          .from("bakes")
          .select("*")
          .eq("recipe_id", recipe.id)
          .order("baked_on", { ascending: false })
          .order("id", { ascending: false }),
        supabase.from("recipe_notes").select("body").eq("recipe_id", recipe.id).maybeSingle(),
      ]);
      if (ignore) return;
      if (bakes.error || note.error) {
        console.error("Loading your notebook failed:", (bakes.error ?? note.error).message);
        setJournal({ failed: true, bakes: [], note: "" });
        return;
      }
      setJournal({ failed: false, bakes: bakes.data.map(fromBakeRow), note: note.data?.body ?? "" });
    }

    load();
    return () => {
      ignore = true;
    };
  }, [recipe.id, version]);

  return (
    <section aria-labelledby="journal-heading" className="graph sheet mt-16 px-5 pb-7 pt-9 md:px-8">
      <h2 id="journal-heading" className="section-title">
        <span className="highlight">Your notebook</span>
      </h2>

      {journal === undefined && <p className="mt-4 font-mono text-muted">Loading…</p>}

      {journal === null && (
        <p className="mt-4 max-w-lg">
          <Link href={`/login?next=/recipes/${recipe.id}`} className="font-mono font-bold underline underline-offset-4">
            Sign in
          </Link>{" "}
          to log when you bake this, rate how it went, and keep private notes on it.
        </p>
      )}

      {journal?.failed && (
        <p className="mt-4 max-w-lg text-muted">Your notebook couldn’t be loaded. Try refreshing the page.</p>
      )}

      {journal && !journal.failed && (
        <div className="mt-6 grid gap-10 md:grid-cols-2">
          <BakeHistory recipe={recipe} bakes={journal.bakes} onLogged={() => setVersion(version + 1)} />
          <NoteEditor recipeId={recipe.id} initialNote={journal.note} />
        </div>
      )}
    </section>
  );
}

// "I made this" plus the list of past bakes of this recipe.
function BakeHistory({ recipe, bakes, onLogged }) {
  const [isOpen, setIsOpen] = useState(false);
  const [bakedOn, setBakedOn] = useState(today());
  const [rating, setRating] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("idle"); // "idle", "saving" or an error

  const average = averageRating(bakes);

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("saving");
    // The recipe's measurements are filled in for you (lib/bakes.js), so
    // the bake log has them for the analysis later.
    const result = await createBake({ ...bakeFromRecipe(recipe), bakedOn, rating, notes });
    if (result.error) {
      setStatus(result.error);
      return;
    }
    setStatus("idle");
    setIsOpen(false);
    setRating("");
    setNotes("");
    onLogged();
  }

  return (
    <div>
      <h3 className="font-mono text-lg font-bold">Your bakes</h3>
      <p className="mt-1 text-muted">
        {bakes.length === 0
          ? "You haven’t logged this one yet."
          : `Made ${bakes.length} ${bakes.length === 1 ? "time" : "times"}${
              average !== null ? `, your average ★ ${average}` : ""
            }.`}
      </p>

      {!isOpen && (
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          <button type="button" className="btn" onClick={() => setIsOpen(true)}>
            I made this
          </button>
          <Link href={`/bakes/new?recipe=${recipe.id}`} className="font-mono text-sm underline underline-offset-4">
            Log full details
          </Link>
        </div>
      )}

      {isOpen && (
        <form onSubmit={handleSubmit} className="note mt-4 grid gap-3 px-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="quick-date" className="label block">Baked on</label>
              <input id="quick-date" className="field mt-1 font-mono" type="date" value={bakedOn} onChange={(event) => setBakedOn(event.target.value)} required />
            </div>
            <div>
              <label htmlFor="quick-rating" className="label block">How was it?</label>
              <select id="quick-rating" className="field mt-1 font-mono" value={rating} onChange={(event) => setRating(event.target.value)}>
                <option value="">no rating</option>
                {RATINGS.map((value) => (
                  <option key={value} value={value}>★ {value}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="quick-notes" className="label block">Notes</label>
            <textarea id="quick-notes" className="field mt-1" rows="3" maxLength={2000} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Spread more than last time; try chilling the dough." />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className="btn" disabled={status === "saving"}>
              {status === "saving" ? "Saving…" : "Log this bake"}
            </button>
            <button type="button" className="font-mono text-sm underline underline-offset-4" onClick={() => setIsOpen(false)}>
              Cancel
            </button>
          </div>
          {status !== "idle" && status !== "saving" && (
            <p role="alert" className="alert">{status}</p>
          )}
        </form>
      )}

      {bakes.length > 0 && (
        <ul className="mt-5">
          {bakes.slice(0, 5).map((bake) => (
            <li key={bake.id} className="border-b border-dashed border-line py-2.5 last:border-b-0">
              <Link href={`/bakes/${bake.id}/edit`} className="group block">
                <span className="flex flex-wrap items-baseline justify-between gap-x-3 font-mono text-sm">
                  <span className="group-hover:underline">{bake.bakedOn}</span>
                  {bake.rating !== null && <b>★ {bake.rating}</b>}
                </span>
                {(bake.notes || bake.whatWentWrong) && (
                  <span className="mt-0.5 block line-clamp-2 text-sm text-muted">
                    {bake.whatWentWrong || bake.notes}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
      {bakes.length > 5 && (
        <Link href="/bakes" className="mt-2 inline-block font-mono text-sm underline underline-offset-4">
          All your bakes
        </Link>
      )}
    </div>
  );
}

// A private note on the recipe, saved with a button. An empty note is
// deleted rather than saved.
function NoteEditor({ recipeId, initialNote }) {
  const [note, setNote] = useState(initialNote);
  const [savedNote, setSavedNote] = useState(initialNote);
  const [status, setStatus] = useState("idle"); // "idle", "saving", "saved" or an error
  const hasChanges = note !== savedNote;

  async function handleSave() {
    setStatus("saving");
    const notes = createClient().from("recipe_notes");
    const body = note.trim();
    const { error } =
      body === ""
        ? await notes.delete().eq("recipe_id", recipeId)
        : await notes.upsert(
            { recipe_id: recipeId, body, updated_at: new Date().toISOString() },
            { onConflict: "user_id,recipe_id" }
          );
    if (error) {
      console.error("Saving a note failed:", error.message);
      setStatus("Your note couldn’t be saved. Try again in a moment.");
      return;
    }
    setNote(body);
    setSavedNote(body);
    setStatus("saved");
  }

  return (
    <div>
      <label htmlFor="recipe-note" className="font-mono text-lg font-bold">
        Your note
      </label>
      <p className="mt-1 text-muted">Only you can see it.</p>
      <textarea
        id="recipe-note"
        className="field note-ruled mt-3 bg-[position:0_7px] leading-7"
        rows="6"
        maxLength={5000}
        value={note}
        onChange={(event) => {
          setNote(event.target.value);
          setStatus("idle");
        }}
        placeholder="Swaps that worked, timings for your oven, what to try next…"
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="button" className="btn-quiet" disabled={!hasChanges || status === "saving"} onClick={handleSave}>
          {status === "saving" ? "Saving…" : "Save note"}
        </button>
        {/* role="status" announces "Saved" to screen readers */}
        <span role="status" className="font-mono text-sm text-muted">
          {status === "saved" && !hasChanges ? "Saved" : ""}
        </span>
      </div>
      {!["idle", "saving", "saved"].includes(status) && (
        <p role="alert" className="alert mt-3">{status}</p>
      )}
    </div>
  );
}
