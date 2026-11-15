import Link from "next/link";
import HandArrow from "@/components/HandArrow";
import Diagram from "@/components/chemistry/Diagram";
import { CONTENT } from "@/lib/chemistry/content";
import { TOPICS } from "@/lib/chemistry/topics";

export const metadata = {
  title: "Chemistry",
  description:
    "Short explainers on the science of baking: leaveners, gluten, hydration, sugar, fats, eggs, browning and oven temperature.",
};

// Each card tilts a little, alternating, like notes pinned up by hand.
const TILTS = ["-rotate-[0.8deg]", "rotate-[0.6deg]", "-rotate-[0.4deg]", "rotate-[0.9deg]"];

// The index of chemistry explainers, at /chemistry. Everything here is
// written in the code, so Next.js builds it once as a static page.
export default function ChemistryPage() {
  return (
    <main className="page pt-6">
      <div className="grid gap-x-10 gap-y-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div>
          <h1 className="page-title">
            <span className="highlight">Chemistry</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg">
            Short notes on why bakes work, and what’s going on when they
            don’t. Each one ends with what to change next time.
          </p>
        </div>
        <p className="hand flex max-w-64 -rotate-2 items-end gap-1 text-muted">
          ever swapped soda for powder? start with #01
          <HandArrow shape="downRight" className="mb-[-0.5rem]" />
        </p>
      </div>

      {/* 1 column on phones, 2 from "sm", 4 from "lg" */}
      <ol className="mt-10 grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
        {TOPICS.map((topic, index) => (
          <li key={topic.slug}>
            <Link
              href={`/chemistry/${topic.slug}`}
              className={`note tape group block h-full px-4 pb-5 pt-7 transition-[rotate,translate] duration-200 hover:-translate-y-1 hover:rotate-0 focus-visible:-translate-y-1 focus-visible:rotate-0 ${TILTS[index % TILTS.length]}`}
            >
              {/* The sketch on a square of graph paper. aria-hidden on the
                  wrapper: the card's title already says what it is about. */}
              <div className="graph -mx-1 mb-4 px-3 py-3" aria-hidden="true">
                <Diagram slug={topic.slug} label="" />
              </div>
              <p className="label">
                Note #{String(topic.number).padStart(2, "0")}
              </p>
              <h2 className="mt-1 font-mono text-lg font-bold leading-snug tracking-tight [text-wrap:balance] group-hover:underline">
                {topic.title}
              </h2>
              <p className="mt-2 text-[0.9375rem] text-muted">{topic.short}</p>
            </Link>
          </li>
        ))}
      </ol>

      <p className="mt-12 max-w-xl text-sm text-muted">
        These notes simplify on purpose. Figures are typical values from
        common baking references, rounded; your flour, oven and kitchen will
        vary. {/* Number of explainers, so this stays right if more are added */}
        {Object.keys(CONTENT).length} notes so far.
      </p>
    </main>
  );
}
