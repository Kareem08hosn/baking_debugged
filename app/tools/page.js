import Link from "next/link";
import PanConverter from "@/components/tools/PanConverter";
import RecipeScaler from "@/components/tools/RecipeScaler";
import UnitConverter from "@/components/tools/UnitConverter";
import AltitudeAdjuster from "@/components/tools/AltitudeAdjuster";

export const metadata = {
  title: "Lab tools",
  description:
    "Scale any recipe, convert between pan sizes, and turn grams into cups and back.",
};

// The three tools, with a short explanation beside each. "id" lets the
// jump links at the top scroll to a section (/tools#pans).
const SECTIONS = [
  {
    id: "scaler",
    title: "Recipe scaler",
    text: "Type a recipe’s ingredients in grams, say how many it makes and how many you want. Every amount is multiplied by the same factor.",
    note: "works for any recipe, not just the ones here",
    Tool: RecipeScaler,
  },
  {
    id: "pans",
    title: "Pan converter",
    text: "Got a 20 cm round recipe and a 33 × 23 cm pan? This compares the base areas and tells you how much to multiply by, so the batter comes out the same depth.",
    note: "bigger pan, same depth, more batter",
    Tool: PanConverter,
  },
  {
    id: "units",
    title: "Unit converter",
    text: "Grams to cups and back, for the most common baking ingredients, plus oven temperatures. Weighing is more accurate, but not everyone owns a scale.",
    note: "a cup of flour ≠ a cup of sugar",
    Tool: UnitConverter,
  },
  {
    id: "altitude",
    title: "High altitude",
    text: "Up a mountain, lower air pressure makes bakes over-rise, collapse and dry out. This suggests how to change a recipe for your altitude.",
    note: "less leavener, more liquid, hotter oven",
    Tool: AltitudeAdjuster,
  },
];

export default function ToolsPage() {
  return (
    <main className="page pt-6">
      <h1 className="font-mono text-[clamp(2.6rem,11vw,4.5rem)] font-extrabold leading-none tracking-[-0.05em]">
        <span className="highlight">Lab tools</span>
      </h1>
      <p className="mt-4 max-w-xl text-lg">
        The same maths the recipe pages use, for any recipe you bring.
      </p>

      <p className="mt-4 text-sm">
        Also:{" "}
        <Link href="/substitutions" className="font-mono underline underline-offset-4">substitutions</Link>,{" "}
        <Link href="/debugger" className="font-mono underline underline-offset-4">bake debugger</Link>,{" "}
        <Link href="/pantry" className="font-mono underline underline-offset-4">what can I make?</Link>,{" "}
        <Link href="/find" className="font-mono underline underline-offset-4">find a recipe by describing it</Link>.
      </p>
      <nav aria-label="Tools on this page" className="mt-5 flex flex-wrap gap-2">
        {SECTIONS.map((section) => (
          <a key={section.id} href={`#${section.id}`} className="chip">
            {section.title}
          </a>
        ))}
      </nav>

      {/* Each tool: the explanation in one column, the tool in the other.
          Every second section swaps sides (md:order-2) for some rhythm.
          { id, title, ... } pulls those fields out of each section object;
          Tool has a capital letter so React can draw it as <Tool />. */}
      {SECTIONS.map(({ id, title, text, note, Tool }, index) => {
        // Odd sections (the 2nd) put the tool on the left. The columns are
        // swapped too, so the tool always gets the wide one.
        const isSwapped = index % 2 === 1;
        return (
        <section
          key={id}
          id={id}
          aria-labelledby={`${id}-heading`}
          className={`mt-16 grid scroll-mt-6 gap-8 md:items-start md:gap-12 ${
            isSwapped
              ? "md:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]"
              : "md:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)]"
          }`}
        >
          <div className={isSwapped ? "md:order-2 md:pt-6" : "md:pt-6"}>
            <h2 id={`${id}-heading`} className="section-title">
              {title}
            </h2>
            <p className="mt-4 max-w-md">{text}</p>
            <p className="hand mt-4 -rotate-2 text-muted">{note}</p>
          </div>
          <div className="min-w-0">
            <Tool />
          </div>
        </section>
        );
      })}
    </main>
  );
}
