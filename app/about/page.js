import Link from "next/link";
import LogoMark from "@/components/LogoMark";
import RatingStamp from "@/components/RatingStamp";
import ChannelLinks from "@/components/home/ChannelLinks";
import { getRecipes } from "@/lib/recipes";

export const metadata = {
  title: "About",
  description: "Who runs Baking Debugged, how the recipes are tested, and what’s being built next.",
};

// Rebuilt at most once a minute, because the recipe count comes from the
// database (see app/page.js).
export const revalidate = 60;

// What the site is built with: shown as a list of lab equipment.
const EQUIPMENT = [
  { item: "Next.js + React", use: "the pages and the interactive tools" },
  { item: "Supabase (Postgres)", use: "recipes, sign-in, bake logs, with row-level security" },
  { item: "Python", use: "the recipe scaler, mirrored in JavaScript, with tests for both" },
  { item: "pandas + scikit-learn", use: "next: finding what makes a bake work" },
];

// The plan. "done" items get a ticked box.
const ROADMAP = [
  { step: "Recipes in grams, with scaling, pans and unit conversion", done: true },
  { step: "Chemistry notes and lab tools", done: true },
  { step: "Accounts: your own recipes, saved recipes, notes and preferences", done: true },
  { step: "A bake log: record every bake and what went wrong, with CSV import and export", done: true },
  { step: "Data analysis and a simple model of what predicts a good bake", done: false },
  { step: "“Why did my bake fail?”: rules from chemistry, then the model, then plain-language AI explanations", done: false },
];

// A box drawn in pen, ticked or not.
function CheckBox({ checked }) {
  return (
    <svg viewBox="0 0 24 24" className="mt-0.5 size-6 flex-none" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      {checked && <path d="M7 12.5 L10.5 16 L17.5 8" strokeWidth="2.8" />}
    </svg>
  );
}

// The About page, at /about. Personal details are left as clearly marked
// placeholders for Kareem to fill in: nothing about him is made up here.
export default async function AboutPage() {
  const recipeCount = (await getRecipes()).length;

  return (
    <main className="page pt-6">
      {/* ---------- Intro + the "ID card" ---------- */}
      <section className="grid gap-10 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:items-center">
        <div>
          <h1 className="font-mono text-[clamp(2.6rem,11vw,4.5rem)] font-extrabold leading-none tracking-[-0.05em]">
            <span className="highlight">About</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg">
            Baking Debugged is a baking notebook that treats every bake as an
            experiment: measure it, write down what happened, and work out
            why.
          </p>
          {/* TODO: Kareem — replace this paragraph with a few sentences
              about yourself, in your own words. */}
          <p className="mt-4 max-w-xl">
            [TODO: Kareem] A few sentences about who you are, how you got into
            baking, and why you started taking notes on every bake.
          </p>
        </div>

        {/* A taped-in ID card with a photo spot */}
        <div className="note tape mx-auto w-full max-w-80 rotate-[1.5deg] px-5 pb-5 pt-8">
          {/* TODO: Kareem — swap this square for a photo (next/image). */}
          <div className="graph grid aspect-square place-content-center justify-items-center gap-3 border-[1.5px] border-dashed border-muted">
            <LogoMark className="size-20 rounded-full bg-foreground text-background" />
            <p className="hand text-muted">[TODO: Kareem] photo</p>
          </div>
          <dl className="mt-4 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 font-mono text-sm">
            <dt className="text-muted">Baker</dt>
            <dd>[TODO: Kareem]</dd>
            <dt className="text-muted">Based in</dt>
            <dd>[TODO: Kareem]</dd>
            <dt className="text-muted">Recipes</dt>
            <dd className="tabular-nums">{recipeCount}</dd>
          </dl>
        </div>
      </section>

      {/* ---------- How the stamps work ---------- */}
      <section aria-labelledby="stamps-heading" className="mt-20">
        <h2 id="stamps-heading" className="section-title">
          <span className="highlight">How the recipes are marked</span>
        </h2>
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <div className="note flex gap-5 px-5 py-6">
            <RatingStamp rating={4.6} tested={false} className="flex-none" />
            <div>
              <h3 className="font-mono font-bold">Untested</h3>
              <p className="mt-1.5">
                Adapted from another site and rewritten in grams, but not
                baked here yet. The stars are the original site’s rating, and
                every one of these links to its source.
              </p>
            </div>
          </div>
          <div className="note flex gap-5 px-5 py-6">
            <RatingStamp rating={4.5} tested={true} className="flex-none" />
            <div>
              <h3 className="font-mono font-bold">Tested</h3>
              <p className="mt-1.5">
                Baked in this kitchen, measured, and rated here. Recipes move
                from untested to tested as they get baked.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Roadmap + equipment, side by side ---------- */}
      <section className="mt-20 grid gap-16 md:grid-cols-2">
        <div>
          <h2 className="section-title">What’s being built</h2>
          <p className="hand mt-3 -rotate-1 text-muted">the plan, in order</p>
          {/* An ordered list: this really is a sequence */}
          <ol className="mt-5">
            {ROADMAP.map((entry) => (
              <li key={entry.step} className="flex gap-3 border-b border-dashed border-line py-3 last:border-b-0">
                <CheckBox checked={entry.done} />
                <span className={entry.done ? "text-muted" : ""}>
                  {entry.step}
                  <span className="sr-only">{entry.done ? " (done)" : " (not done yet)"}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <h2 className="section-title">Lab equipment</h2>
          <p className="hand mt-3 -rotate-1 text-muted">what the site runs on</p>
          <dl className="note note-ruled tape mt-7 px-5 pb-4 pt-7">
            {EQUIPMENT.map((entry) => (
              <div key={entry.item}>
                <dt className="font-mono font-bold leading-7">{entry.item}</dt>
                <dd className="leading-7 text-muted">{entry.use}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------- Channel ---------- */}
      <section className="mt-20 grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-center">
        <ChannelLinks />
        <p className="max-w-md md:pt-24">
          The experiments, the failures and the fixes are filmed for short
          videos. Ideas for what to bake or break next are welcome there.{" "}
          <Link href="/recipes" className="underline underline-offset-4">
            Or start with the recipes
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
