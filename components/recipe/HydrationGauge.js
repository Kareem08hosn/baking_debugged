// A gauge for dough hydration: a ruled bar from 50% to 100% with a marker
// at this recipe's value, like the needle on a lab instrument.
const MIN = 50;
const MAX = 100;

// Rough landmarks so the number means something. Typical values, not rules.
const LANDMARKS = [
  { at: 60, label: "sandwich loaf" },
  { at: 75, label: "open crumb" },
];

// Where a value sits along the bar, as a percentage of its width (0 to 100).
// Math.min/Math.max keep it on the bar if the value is off the scale.
function position(value) {
  const clamped = Math.min(MAX, Math.max(MIN, value));
  return ((clamped - MIN) / (MAX - MIN)) * 100;
}

export default function HydrationGauge({ value }) {
  return (
    <figure className="mt-5 print:hidden">
      <figcaption className="flex items-baseline justify-between font-mono text-sm">
        <span>hydration</span>
        <b className="text-lg tabular-nums">{value}%</b>
      </figcaption>

      {/* aria-hidden: the number above already says everything; the bar is
          a picture of it. */}
      <div className="relative mt-1.5 h-10" aria-hidden="true">
        {/* The ruled bar: a tick every 5% drawn with a repeating gradient */}
        <div className="absolute inset-x-0 top-0 h-3.5 border-[1.5px] border-foreground bg-[repeating-linear-gradient(90deg,transparent_0_calc(10%-1px),var(--line)_calc(10%-1px)_10%)]" />
        {/* The needle. style={{ left: "63%" }} sets the CSS directly: the
            position depends on data, so it can't be a fixed class. */}
        <div
          className="absolute -top-1 h-5.5 w-1 -translate-x-1/2 bg-foreground"
          style={{ left: `${position(value)}%` }}
        />
        {LANDMARKS.map((mark) => (
          <span
            key={mark.at}
            className="hand absolute top-5 -translate-x-1/2 whitespace-nowrap text-[0.95rem] text-muted"
            style={{ left: `${position(mark.at)}%` }}
          >
            {mark.label}
          </span>
        ))}
      </div>
      <div className="flex justify-between font-mono text-[0.6875rem] text-muted" aria-hidden="true">
        <span>{MIN}% stiffer</span>
        <span>wetter {MAX}%</span>
      </div>
    </figure>
  );
}
