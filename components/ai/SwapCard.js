import Link from "next/link";
import { getTopic } from "@/lib/chemistry/topics";

// How well a swap works, as a stamp. "poorly" is shown muted.
const WORKS_LABEL = { well: "Works well", okay: "Works okay", poorly: "Works poorly" };

// One substitute: the notebook's own or the AI's.
//   swap            { to or name, amount, works, effect, chemistry, topic? }
//   showChemistry   chemistry mode on or off
//   source          "notebook" or "ai"
export default function SwapCard({ swap, showChemistry, source }) {
  const topic = swap.topic ? getTopic(swap.topic) : null;
  return (
    <li className="note px-5 py-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="min-w-0 font-mono text-lg font-bold leading-snug">{swap.to ?? swap.name}</h3>
        <span className={`stamp-label flex-none rotate-2 ${swap.works === "poorly" ? "text-muted" : ""}`}>
          {WORKS_LABEL[swap.works]}
        </span>
      </div>
      <p className="mt-2 font-mono text-[0.9375rem]">{swap.amount}</p>
      <p className="mt-2">{swap.effect}</p>
      {showChemistry && swap.chemistry && (
        <p className="mt-3 border-t border-dashed border-line pt-3">
          <b className="font-mono">Why: </b>
          {swap.chemistry}
        </p>
      )}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
        {topic ? (
          <Link href={`/chemistry/${topic.slug}`} className="font-mono underline underline-offset-4">
            The chemistry: {topic.title}
          </Link>
        ) : (
          <span />
        )}
        <span className="font-mono text-muted">{source === "ai" ? "AI suggestion: check it" : "From the notebook"}</span>
      </div>
    </li>
  );
}
