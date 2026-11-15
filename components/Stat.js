// One cell in a strip of key numbers (used on recipe pages and /bakes).
// It sits inside a <dl>, so the label is a <dt> and the number a <dd>.
export default function Stat({ label, value }) {
  return (
    <div className="bg-surface px-4 py-3">
      <dt className="label">{label}</dt>
      <dd className="mt-0.5 truncate font-mono text-xl font-bold tabular-nums">{value}</dd>
    </div>
  );
}
