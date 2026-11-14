import Link from "next/link";
import SignInCard from "@/components/SignInCard";
import ExportButton from "@/components/bakes/ExportButton";
import { summarizeBakes } from "@/lib/bakes";
import { getMyBakes } from "@/lib/journal";
import { getUser } from "@/lib/supabase/server";

export const metadata = { title: "Bake log" };

// One figure in the summary strip
function Stat({ label, value }) {
  return (
    <div className="bg-surface px-4 py-3">
      <dt className="label">{label}</dt>
      <dd className="mt-0.5 truncate font-mono text-xl font-bold tabular-nums">{value}</dd>
    </div>
  );
}

// "72 %" or "–" for a missing number
function show(value, unit = "") {
  return value === null ? "–" : `${value}${unit}`;
}

// The signed-in person's bake log, at /bakes.
export default async function BakesPage() {
  const user = await getUser();
  if (!user) {
    return (
      <main className="page pt-6">
        <h1 className="font-mono text-[clamp(2.6rem,11vw,4.5rem)] font-extrabold leading-none tracking-[-0.05em]">
          <span className="highlight">Bake log</span>
        </h1>
        <SignInCard
          title="Sign in to keep a bake log"
          text="Record every bake (measurements, oven, what went wrong) and spot what makes the good ones good."
        />
      </main>
    );
  }

  const bakes = await getMyBakes();
  const summary = summarizeBakes(bakes);

  return (
    <main className="page pt-6">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div>
          <h1 className="font-mono text-[clamp(2.6rem,11vw,4.5rem)] font-extrabold leading-none tracking-[-0.05em]">
            <span className="highlight">Bake log</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg">
            Every bake, measured. Enough entries and the patterns start to show.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/bakes/new" className="btn">Log a bake</Link>
          <Link href="/bakes/import" className="btn-quiet">Import CSV</Link>
          <ExportButton bakes={bakes} />
        </div>
      </div>

      {bakes.length === 0 ? (
        <div className="note note-ruled tape mx-auto mt-12 max-w-md -rotate-1 px-5 pb-6 pt-8">
          <p className="font-mono text-lg font-bold leading-7">No bakes logged yet</p>
          <p className="leading-7">
            Log your next bake, press “I made this” on a recipe, or import the
            spreadsheet you already keep.
          </p>
        </div>
      ) : (
        <>
          {/* Same strip trick as the recipe page: gap-px over a line-coloured background */}
          <dl className="note mt-8 grid grid-cols-2 gap-px bg-line sm:grid-cols-4">
            <Stat label="Bakes" value={summary.count} />
            <Stat label="Average rating" value={summary.averageRating === null ? "–" : `★ ${summary.averageRating}`} />
            <Stat label="Most baked" value={`${summary.mostBaked.title} ×${summary.mostBaked.count}`} />
            <Stat label="Last bake" value={summary.lastBakedOn} />
          </dl>

          {/* Each bake is a row in the log. On phones the row wraps into
              two lines; from "md" up the figures line up in columns. */}
          <ol className="mt-10">
            {bakes.map((bake) => (
              <li key={bake.id} className="border-b border-line">
                <Link
                  href={`/bakes/${bake.id}/edit`}
                  className="grid grid-cols-[6.5rem_minmax(0,1fr)_auto] gap-x-4 gap-y-1 px-1 py-3.5 transition-colors hover:bg-surface md:grid-cols-[6.5rem_minmax(0,1.6fr)_repeat(3,5.5rem)_4rem]"
                >
                  <span className="font-mono text-sm tabular-nums text-muted">{bake.bakedOn}</span>
                  <span className="min-w-0">
                    <span className="block truncate font-mono font-bold">{bake.title}</span>
                    {(bake.whatWentWrong || bake.notes) && (
                      <span className="block truncate text-sm text-muted">{bake.whatWentWrong || bake.notes}</span>
                    )}
                  </span>
                  <span className="hidden font-mono text-sm tabular-nums md:block">
                    <span className="sr-only">Hydration </span>{show(bake.hydrationPct, "%")}
                  </span>
                  <span className="hidden font-mono text-sm tabular-nums md:block">
                    <span className="sr-only">Oven </span>{show(bake.ovenTempC, "°C")}
                  </span>
                  <span className="hidden font-mono text-sm tabular-nums md:block">
                    <span className="sr-only">Bake time </span>{show(bake.bakeTimeMin, " min")}
                  </span>
                  <span className="text-right font-mono font-bold tabular-nums">
                    {bake.rating === null ? <span className="text-muted">–</span> : `★ ${bake.rating}`}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
          <p className="mt-3 hidden font-mono text-xs text-muted md:block">
            columns: date · bake · hydration · oven · bake time · rating
          </p>
        </>
      )}
    </main>
  );
}
