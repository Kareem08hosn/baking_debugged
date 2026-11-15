// A hand-drawn cross, used as the bullet for "what goes wrong" lists.
// className lets the page nudge its position.
export default function PenCross({ className = "mt-0.5" }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={`${className} size-5 flex-none`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M4 4 L16 17 M16 3 L5 16" />
    </svg>
  );
}
