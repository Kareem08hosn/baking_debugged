import Link from "next/link";
import HandArrow from "@/components/HandArrow";
import RecipeCard from "@/components/RecipeCard";

// The top of the homepage: the tagline, two buttons, and the top-rated
// recipe as a card dropped on a sheet of graph paper.
// "recipe" may be null (an empty database); then the card is left out.
export default function HomeHero({ recipe }) {
  return (
    // One column on phones. From "lg" up: two columns, where "auto" makes
    // the first exactly as wide as the headline and the second takes the rest.
    <section className="page grid gap-9 pb-14 pt-6 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center lg:gap-8 lg:pb-20 lg:pt-12">
      <div>
        {/* clamp(min, preferred, max): the size follows the screen width
            (14.5vw = 14.5% of it) but never leaves the two limits. */}
        <h1 className="font-mono text-[clamp(3.1rem,14.5vw,6.75rem)] font-extrabold leading-[0.95] tracking-[-0.055em]">
          <span className="highlight highlight-draw">
            Baking,
            <br />
            debugged.
          </span>
        </h1>

        {/* A handwritten note in the margin explaining the word */}
        <p className="hand ml-auto mt-5 flex max-w-76 -rotate-2 items-start gap-1 lg:mr-4">
          <HandArrow shape="upLeft" className="-mt-5" />
          debugged = found out why it flopped, then fixed it
        </p>

        <p className="mt-5 max-w-md text-lg">
          Recipes measured in grams, and the chemistry behind why a bake
          works or fails.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/recipes" className="btn">
            Browse the recipes
          </Link>
          <Link href="/chemistry" className="btn-paper">
            Read the chemistry
          </Link>
        </div>
      </div>

      {recipe && (
        <div className="relative mx-auto w-full max-w-84 pt-11">
          <p className="hand absolute -top-1 left-1 flex -rotate-[4deg] items-start gap-1">
            highest rated in the book
            <HandArrow shape="downRight" className="mt-2" />
          </p>
          {/* A sheet of graph paper peeking out from behind the card */}
          <div
            className="graph absolute -bottom-3.5 -right-1.5 left-5 top-13 rotate-[4deg] shadow-[0_1px_0_var(--line),0_12px_22px_-14px_var(--shadow)]"
            aria-hidden="true"
          />
          <div className="drop-in relative -rotate-[2.5deg]">
            <RecipeCard recipe={recipe} position={1} />
          </div>
        </div>
      )}
    </section>
  );
}
