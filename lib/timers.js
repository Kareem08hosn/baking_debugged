// Finds cooking times written in recipe steps, for the step timers.
// No React: tested in lib/timers.test.js.

// "Bake 30 to 35 minutes" -> 30 (the shortest: check early)
// "Rise 1 to 2 hours" -> 60; "about 1 hour" -> 60; "1½ hours" -> 90
// Returns minutes, or null if the step has no time in it.
export function minutesInStep(step) {
  const text = String(step).replace(/½/g, ".5").replace(/¼/g, ".25").replace(/¾/g, ".75");
  // number, optionally "to"/"-" another number, then a unit
  const found = text.match(/(\d+(?:\.\d+)?)\s*(?:(?:to|-|–)\s*\d+(?:\.\d+)?\s*)?(hours?|hrs?|minutes?|mins?)\b/i);
  if (!found) {
    return null;
  }
  const amount = Number(found[1]);
  const isHours = /^h/i.test(found[2]);
  const minutes = Math.round(isHours ? amount * 60 : amount);
  // Ignore silly values (a typo, or "48 hours" of cold fermentation)
  return minutes >= 1 && minutes <= 12 * 60 ? minutes : null;
}

// How a length of time is written on a timer button: 30 -> "30 min",
// 60 -> "1 h", 90 -> "1 h 30 min"
export function formatMinutes(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

// A clock reading from seconds: "4:07", or "1:02:03" past an hour
export function formatClock(totalSeconds) {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}
