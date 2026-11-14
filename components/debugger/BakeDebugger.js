"use client";

import { useState } from "react";
import Link from "next/link";
import { getTopic } from "@/lib/chemistry/topics";
import { BAKE_TYPES, SYMPTOMS, cleanDetails, detailsFor, diagnose } from "@/lib/debugger";

// A choice drawn as a chip. The real input (radio or checkbox) is hidden
// but still works with keyboards and screen readers; Tailwind's "has-"
// variants style the chip when the input inside it is checked or focused.
const CHIP =
  "chip relative cursor-pointer has-[:checked]:bg-foreground has-[:checked]:text-background has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-foreground";

// The debugger: pick a bake type and symptoms (plus optional details) and
// the likely causes update as you go.
//   initialType, initialDetails  pre-filled from a logged bake, or empty
//   note                          that bake's "what went wrong", shown as a reminder
export default function BakeDebugger({ initialType = "", initialDetails = {}, note = null }) {
  const [type, setType] = useState(initialType);
  const [symptoms, setSymptoms] = useState([]);
  const [rawDetails, setRawDetails] = useState(initialDetails);

  function chooseType(id) {
    setType(id);
    setSymptoms([]); // symptoms differ per bake type
  }

  function toggleSymptom(id) {
    setSymptoms(symptoms.includes(id) ? symptoms.filter((item) => item !== id) : [...symptoms, id]);
  }

  function setDetail(id, value) {
    setRawDetails({ ...rawDetails, [id]: value });
  }

  const results = type ? diagnose(type, symptoms, cleanDetails(rawDetails)) : [];

  return (
    // Three blocks: questions 1-2, the report, then question 3. On phones
    // they stack in that order, so the report comes right after the
    // symptoms. From "lg" up, questions 1-3 share the left column and the
    // report fills the right one (col-start / row-span place it there).
    // grid-rows-[auto_1fr]: the first row is only as tall as questions 1-2,
    // so the tall report's extra height goes into the second row instead of
    // leaving a gap above question 3.
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:grid-rows-[auto_1fr] lg:items-start">
      {/* ---------- Questions 1 and 2 ---------- */}
      <div className="grid gap-8 lg:col-start-1">
        {note && (
          <p className="hand -rotate-1 text-muted">you wrote: “{note}”</p>
        )}

        <fieldset className="note tape px-4 pb-5 pt-8 sm:px-6">
          <legend className="sr-only">What did you bake?</legend>
          <h2 aria-hidden="true" className="font-mono text-2xl font-extrabold tracking-tight">1. What did you bake?</h2>
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
          <fieldset className="note tape px-4 pb-5 pt-8 sm:px-6">
            <legend className="sr-only">What went wrong? Choose all that apply.</legend>
            <h2 aria-hidden="true" className="font-mono text-2xl font-extrabold tracking-tight">2. What went wrong?</h2>
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
      <section aria-labelledby="report-heading" className="lg:sticky lg:top-6 lg:col-start-2 lg:row-span-2 lg:row-start-1">
        <h2 id="report-heading" className="section-title">
          <span className="highlight">Debug report</span>
        </h2>
        {/* Only the count is announced, not the whole list, on every change */}
        <p aria-live="polite" className="mt-3 font-mono text-sm text-muted">
          {symptoms.length === 0
            ? "Choose what you baked and what went wrong."
            : `${results.length} possible ${results.length === 1 ? "cause" : "causes"}, most likely first.`}
        </p>

        {symptoms.length === 0 ? (
          <div className="graph sheet mt-6 px-5 pb-6 pt-8">
            <p className="font-mono font-bold">No symptoms yet</p>
            <p className="mt-1.5">
              Likely causes appear here as you answer, with the reasons they
              ranked where they did and what to change next time.
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
          Rules from baking chemistry, not AI. Change one thing at a time and
          log the next bake, so you know what fixed it.
        </p>
      </section>

      {/* ---------- Question 3 ---------- */}
      <div className="lg:col-start-1">
        {type && (
          <fieldset className="note px-4 pb-5 pt-6 sm:px-6">
            <legend className="sr-only">Details (optional)</legend>
            <h2 aria-hidden="true" className="font-mono text-2xl font-extrabold tracking-tight">3. Details</h2>
            <p className="mt-1 text-sm text-muted">Optional. Each answer sharpens the ranking.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {detailsFor(type).map((detail) => (
                <div key={detail.id}>
                  <label htmlFor={`detail-${detail.id}`} className="label block normal-case tracking-normal text-[0.8125rem]">
                    {detail.label}
                    {detail.unit && ` (${detail.unit})`}
                  </label>
                  {detail.kind === "number" ? (
                    <input
                      id={`detail-${detail.id}`}
                      className="field mt-1 font-mono"
                      type="number"
                      inputMode="decimal"
                      step="any"
                      min={detail.min}
                      max={detail.max}
                      value={rawDetails[detail.id] ?? ""}
                      onChange={(event) => setDetail(detail.id, event.target.value)}
                    />
                  ) : (
                    <select
                      id={`detail-${detail.id}`}
                      className="field mt-1"
                      value={rawDetails[detail.id] ?? ""}
                      onChange={(event) => setDetail(detail.id, event.target.value)}
                    >
                      <option value="">not sure</option>
                      {(detail.kind === "yes-no" ? [["yes", "Yes"], ["no", "No"]] : detail.options).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>
          </fieldset>
        )}
      </div>


    </div>
  );
}
