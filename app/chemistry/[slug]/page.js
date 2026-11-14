import Link from "next/link";
import { notFound } from "next/navigation";
import RecipeCard from "@/components/RecipeCard";
import Diagram from "@/components/chemistry/Diagram";
import { CONTENT } from "@/lib/chemistry/content";
import { TOPICS, getTopic, recipesForTopic } from "@/lib/chemistry/topics";
import { getRecipes } from "@/lib/recipes";

// Rebuilt at most once a minute, because the recipe links come from the
// database (see app/page.js).
export const revalidate = 60;

// Only the slugs listed below exist; any other address shows the 404 page
// instead of trying to build a page for it.
export const dynamicParams = false;

// Tells Next.js every page this route has, so all eight are built ahead of
// time: [{ slug: "leaveners" }, { slug: "gluten" }, ...]
export function generateStaticParams() {
  return TOPICS.map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const topic = getTopic(slug);
  return topic ? { title: topic.title, description: topic.short } : {};
}

// A cross drawn with two pen strokes, for the "what goes wrong" list.
function PenCross() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="mt-1 size-5 flex-none"
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

// "#03" from 3
function noteNumber(topic) {
  return `#${String(topic.number).padStart(2, "0")}`;
}

// One chemistry explainer, at /chemistry/leaveners and so on.
export default async function ChemistryNotePage({ params }) {
  const { slug } = await params;
  const topic = getTopic(slug);
  const content = CONTENT[slug];
  if (!topic || !content) {
    notFound(); // shows app/not-found.js
  }

  const recipes = recipesForTopic(topic, await getRecipes());

  // The notes before and after this one, for the links at the bottom.
  const index = TOPICS.indexOf(topic);
  const previous = TOPICS[index - 1];
  const next = TOPICS[index + 1];

  return (
    <main className="page pt-5">
      <Link href="/chemistry" className="inline-block py-1 font-mono text-sm text-muted hover:underline">
        ← All chemistry notes
      </Link>

      <header className="mt-5 max-w-3xl">
        <p className="stamp-label">Chemistry note {noteNumber(topic)}</p>
        <h1 className="mt-5 font-mono text-[clamp(2.2rem,8.5vw,4rem)] font-extrabold leading-[1.02] tracking-[-0.05em] [text-wrap:balance]">
          <span className="highlight">{topic.title}</span>
        </h1>
        <p className="mt-5 text-lg">{content.lead}</p>
      </header>

      {/* On phones: diagram and numbers first, then the text. From "lg" up
          the text is on the left and the diagram column stays in view while
          you scroll (sticky). "order" changes the visual order only. */}
      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14">
        <aside className="grid gap-8 self-start lg:sticky lg:top-6 lg:order-2">
          <figure className="graph sheet px-4 pb-4 pt-6">
            <Diagram slug={slug} label={content.diagramLabel} />
          </figure>

          <div className="note note-ruled tape px-4 pb-3 pt-7">
            <h2 className="font-mono font-bold leading-7">Key numbers</h2>
            {/* A <dl> is a list of terms and values. Each pair takes two
                ruled lines: the name, then the figure under it. */}
            <dl>
              {content.numbers.map((item) => (
                <div key={item.label}>
                  <dt className="label leading-7">{item.label}</dt>
                  <dd className="font-mono font-bold leading-7 tabular-nums">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>

        <article className="min-w-0 lg:order-1">
          {content.sections.map((section) => (
            <section key={section.heading} className="mb-9 max-w-[65ch]">
              <h2 className="font-mono text-2xl font-extrabold leading-tight tracking-tight">
                {section.heading}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mt-3 text-[1.0625rem] leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </article>
      </div>

      <section aria-labelledby="wrong-heading" className="mt-8">
        <h2 id="wrong-heading" className="section-title">
          <span className="highlight">What goes wrong if…</span>
        </h2>
        <ul className="mt-8 grid gap-6 md:grid-cols-2">
          {content.failures.map((failure, i) => (
            <li
              key={failure.cause}
              className={`note px-5 py-5 ${i % 2 === 0 ? "md:-rotate-[0.4deg]" : "md:rotate-[0.5deg]"}`}
            >
              <p className="flex gap-2.5 font-mono text-lg font-bold leading-snug">
                <PenCross />
                <span>…{failure.cause}</span>
              </p>
              <p className="mt-2.5">{failure.result}</p>
              <p className="mt-3 border-t border-dashed border-line pt-3">
                <b className="font-mono">Fix:</b> {failure.fix}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {recipes.length > 0 && (
        <section aria-labelledby="recipes-heading" className="mt-16">
          <h2 id="recipes-heading" className="section-title">
            See it in these recipes
          </h2>
          <ul className="mt-9 grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe, i) => (
              <li key={recipe.id}>
                <RecipeCard recipe={recipe} position={i} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Previous / next note */}
      <nav aria-label="More chemistry notes" className="mt-16 grid gap-4 border-t-[1.5px] border-dashed border-foreground pt-6 font-mono sm:grid-cols-2">
        {previous ? (
          <Link href={`/chemistry/${previous.slug}`} className="group">
            <span className="block text-sm text-muted">← Previous: {noteNumber(previous)}</span>
            <span className="font-bold group-hover:underline">{previous.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/chemistry/${next.slug}`} className="group sm:text-right">
            <span className="block text-sm text-muted">Next: {noteNumber(next)} →</span>
            <span className="font-bold group-hover:underline">{next.title}</span>
          </Link>
        )}
      </nav>
    </main>
  );
}
