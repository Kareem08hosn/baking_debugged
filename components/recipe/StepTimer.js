"use client";

import { useEffect, useState } from "react";
import { formatClock, formatMinutes } from "@/lib/timers";

// A countdown for one step: "Start 30 min timer", then a ticking clock with
// pause and reset. When it reaches zero it says so (on screen, to screen
// readers, and with a short beep).
export default function StepTimer({ minutes }) {
  const total = minutes * 60;
  // endsAt: the time (in ms) it reaches zero while running; null otherwise.
  // pausedLeft: seconds left while paused.
  const [endsAt, setEndsAt] = useState(null);
  const [pausedLeft, setPausedLeft] = useState(null);
  const [now, setNow] = useState(() => Date.now());

  const isRunning = endsAt !== null;
  const left = isRunning ? Math.max(0, (endsAt - now) / 1000) : (pausedLeft ?? total);
  const isDone = isRunning && left === 0;

  // While running, re-read the clock every half second. Working from the
  // end time (not counting ticks) keeps it right even if the phone was
  // locked for a while.
  useEffect(() => {
    if (!isRunning) {
      return;
    }
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [isRunning]);

  // One beep when it finishes. Web Audio makes the sound in code, so no
  // sound file is needed. Browsers only allow it after a tap, which
  // starting the timer was.
  useEffect(() => {
    if (!isDone) {
      return;
    }
    try {
      const audio = new AudioContext();
      const tone = audio.createOscillator();
      tone.frequency.value = 880;
      tone.connect(audio.destination);
      tone.start();
      tone.stop(audio.currentTime + 0.4);
    } catch {
      // No sound available: the on-screen message is enough.
    }
  }, [isDone]);

  function start() {
    const startNow = Date.now();
    setNow(startNow);
    setEndsAt(startNow + (pausedLeft ?? total) * 1000);
    setPausedLeft(null);
  }
  function pause() {
    setPausedLeft(left);
    setEndsAt(null);
  }
  function reset() {
    setEndsAt(null);
    setPausedLeft(null);
  }

  const hasStarted = isRunning || pausedLeft !== null;

  return (
    <span className="mt-2 flex flex-wrap items-center gap-2">
      {!hasStarted && (
        <button type="button" className="chip" onClick={start}>
          Start {formatMinutes(minutes)} timer
        </button>
      )}
      {hasStarted && (
        <>
          <span
            className={`rounded-md border-[1.5px] border-foreground px-2.5 py-1 font-mono text-lg font-bold tabular-nums ${isDone ? "bg-highlight" : ""}`}
            aria-hidden="true"
          >
            {formatClock(left)}
          </span>
          {/* Only the finish is announced, not every second */}
          <span role="status" className={isDone ? "font-mono font-bold" : "sr-only"}>
            {isDone ? "Time’s up!" : ""}
          </span>
          {!isDone && (isRunning ? (
            <button type="button" className="chip" onClick={pause}>Pause</button>
          ) : (
            <button type="button" className="chip" onClick={start}>Resume</button>
          ))}
          <button type="button" className="chip" onClick={reset}>Reset</button>
        </>
      )}
    </span>
  );
}
