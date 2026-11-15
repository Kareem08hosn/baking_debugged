"use client";

import { useState } from "react";
import Link from "next/link";
import { explainDiagnosis } from "@/app/debugger/actions";
import { getTopic } from "@/lib/chemistry/topics";
import { BAKE_TYPES, SYMPTOMS, diagnose } from "@/lib/debugger";

// A choice drawn as a chip. The real input (radio or checkbox) is hidden
// but still works with keyboards and screen readers; Tailwind's "has-"
// variants style the chip when the input inside it is checked or focused.
const CHIP =
  "chip relative cursor-pointer has-[:checked]:bg-foreground has-[:checked]:text-background has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-foreground";

// The debugger: pick a bake type and symptoms and the likely causes update
// as you go.
//   initialType  pre-filled from a logged bake, or empty
//   note         that bake's "what went wrong", shown as a reminder
//   aiEnabled    from the server: can the AI explain it?
export default function BakeDebugger({ initialType = "", note = null, aiEnabled = false }) {
  const [type, setType] = useState(initialType);
  const [symptoms, setSymptoms] = useState([]);

  function chooseType(id) {
    setType(id);
    setSymptoms([]); // symptoms differ per bake type
  }

  function toggleSymptom(id) {
    setSymptoms(symptoms.includes(id) ? symptoms.filter((item) => item !== id) : [...symptoms, id]);
  }

  const results = type ? diagnose(type, symptoms) : [];

  // The AI explanation, remembered with the answers it explains: if the
  // answers change, the old explanation is no longer shown.
  const answersKey = JSON.stringify([type, [...symptoms].sort()]);
  const [explanation, setExplanation] = useState(null); // { key, result } or { key, error }
  const [isExplaining, setIsExplaining] = useState(false);
  const shownExplanation = explanation?.key === answersKey ? explanation : null;

  async function handleExplain() {
    setIsExplaining(true);
    const response = await explainDiagnosis({ type, symptoms });
    setExplanation({ key: answersKey, ...response });
    setIsExplaining(false);
  }

  return (
    // Two blocks: the questions, then the report. On phones they stack, so
    // the report comes right after the symptoms. From "lg" up they sit side
    // by side.
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-start">
      {/* ---------- The questions ---------- */}
      <div className="grid gap-8">
        {note && (
          <p className="hand -rotate-1 text-muted">you wrote: “{note}”</p>
        )}

        <fieldset className="note tape panel">
          <legend className="sr-only">What did you bake?</legend>
          <h2 aria-hidden="true" className="panel-title">1. What did you bake?</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {BAKE_TYPES.map((item) => (
              <label key={item.id} className={CHIP}>
                <input type="radio" name="bake-type" className="sr-only" checked={type === item.id} onChange={() => chooseType(item.id)} />
                {item.label}
              </label>
            ))}
          </div>
        </fieldset>

        {type && (
          <fieldset className="note tape panel">
            <legend className="sr-only">What went wrong? Choose all that apply.</legend>
            <h2 aria-hidden="true" className="panel-title">2. What went wrong?</h2>
            <p className="mt-1 text-sm text-muted">Choose all that apply.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {SYMPTOMS[type].map((item) => (
                <label key={item.id} className={CHIP}>
                  <input type="checkbox" className="sr-only" checked={symptoms.includes(item.id)} onChange={() => toggleSymptom(item.id)} />
                  {item.label}
                </label>
              ))}
            </div>
          </fieldset>
        )}
      </div>

      {/* ---------- The report ---------- */}
      <section aria-labelledby="report-heading" className="lg:sticky lg:top-6">
        <h2 id="report-heading" className="section-title">
          <span className="highlight">Debug report</span>
        </h2>
        {/* Only the count is announced, not the whole list, on every change */}
        <p aria-live="polite" className="mt-3 font-mono text-sm text-muted">
          {symptoms.length === 0
            ? "Choose what you baked and what went wrong."
            : `${results.length} possible ${results.length === 1 ? "cause" : "causes"}, most likely first.`}
        </p>

        {/* Plain-language explanation by the AI (Phase 5 v3) */}
        {symptoms.length > 0 && aiEnabled && (
          <div className="mt-5">
            {!shownExplanation && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <button type="button" className="btn-quiet" onClick={handleExplain} disabled={isExplaining}>
                  {isExplaining ? "Writing it up…" : "Explain it in plain words"}
                </button>
                <span className="text-xs text-muted">Uses Google’s Gemini AI.</span>
              </div>
            )}
            {shownExplanation?.error && (
              <p role="alert" className="alert">{shownExplanation.error}</p>
            )}
            {shownExplanation?.result && (
              <div className="graph sheet px-5 pb-5 pt-7">
                <p className="stamp-label">In plain words</p>
                <p className="mt-4 text-[1.0625rem] leading-relaxed">{shownExplanation.result.summary}</p>
                <p className="mt-3 border-t border-dashed border-line pt-3">
                  <b className="font-mono">Try this first: </b>
                  {shownExplanation.result.tryFirst}
                </p>
                <p className="mt-3 text-sm text-muted">Written by AI from the ranking below. Check it against the causes.</p>
              </div>
            )}
          </div>
        )}

        {symptoms.length === 0 ? (
          <div className="graph sheet mt-6 px-5 pb-6 pt-8">
            <p className="font-mono font-bold">No symptoms yet</p>
            <p className="mt-1.5">
              Likely causes appear here as you answer, with why each happens
              and what to change next time.
            </p>
          </div>
        ) : (
          <ol className="mt-6 grid gap-6">
            {results.map((result, index) => (
              <li key={result.id} className={`note px-5 pb-5 pt-5 ${index === 0 ? "border-l-4 border-foreground" : ""}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h3 className="min-w-0 font-mono text-lg font-bold leading-snug">
                    <span className="sr-only">{index + 1}. </span>
                    {result.cause}
                  </h3>
                  <span className={`stamp-label flex-none rotate-2 ${result.likelihood === "Less likely" ? "text-muted" : ""}`}>
                    {result.likelihood}
                  </span>
                </div>
                <p className="mt-2.5">{result.why}</p>
                {result.reasons.length > 0 && (
                  <div className="mt-3">
                    <p className="label">Why it’s ranked here</p>
                    <ul className="mt-1 list-disc pl-5 text-sm">
                      {result.reasons.map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="mt-3 border-t border-dashed border-line pt-3">
                  <b className="font-mono">Fix:</b> {result.fix}
                </p>
                <Link href={`/chemistry/${result.topic}`} className="mt-2 inline-block font-mono text-sm underline underline-offset-4">
                  The chemistry: {getTopic(result.topic).title}
                </Link>
              </li>
            ))}
          </ol>
        )}

        <p className="mt-6 text-sm text-muted">
          The ranking is rules from baking chemistry, not AI. Change one thing
          at a time and log the next bake, so you know what fixed it.
        </p>
      </section>
    </div>
  );
}
