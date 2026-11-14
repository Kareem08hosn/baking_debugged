import Link from "next/link";
import RatingStamp from "@/components/RatingStamp";
import { hydration, showsHydration } from "@/lib/scaler";

// How many of the three difficulty dots are filled in.
const difficultyDots = { easy: 1, medium: 2, hard: 3 };

// One recipe on the homepage, drawn as a ruled paper note taped to the page.
// "position" is where the card sits in the list (0, 1, 2...); it decides
// which way the note tilts.
export default function RecipeCard({ recipe, position }) {
  const filled = difficultyDots[recipe.difficulty] ?? 0;
  // "●●○" for medium: repeat() writes a character that many times
  const dots = "●".repeat(filled) + "○".repeat(3 - filled);

  // Bread doughs get their hydration as the headline ratio; everything else
  // shows how many it serves.
  const detail = showsHydration(recipe)
    ? `hydration ${hydration(recipe)}%`
    : `serves ${recipe.servings}`;

  // % gives the remainder after dividing: even positions tilt left, odd right.
  const tilt = position % 2 === 0 ? "-rotate-[0.7deg]" : "rotate-[0.6deg]";

  return (
    // The whole note is the link. Backticks make a template string: ${...}
    // drops a value in, so recipe 3 links to "/recipes/3".
    // On hover the note straightens (hover:rotate-0); transition-transform
    // makes that a smooth turn. h-full makes notes in a row the same height.
    <Link
      href={`/recipes/${recipe.id}`}
      className={`note note-ruled tape block h-full px-4 pb-3.5 pt-6.5 transition-transform hover:rotate-0 ${tilt}`}
    >
      {/* The rating (or "untested"), as a rubber stamp in the corner */}
      <RatingStamp rating={recipe.rating} tested={recipe.tested} className="absolute right-3 top-5.5" />

      {/* leading-7 is a 28px line height, matching the ruled lines.
          padStart writes the id as two digits: 3 -> "03". */}
      <p className="label leading-7">
        No. {String(recipe.id).padStart(2, "0")} · {recipe.category}
      </p>
      {/* pr-18 keeps the name clear of the stamp */}
      <h2 className="pr-18 font-mono text-[1.375rem] font-bold leading-7">
        {recipe.name}
      </h2>
      <p className="font-mono text-sm leading-7">
        bake {recipe.bakeTime} min · prep {recipe.prepTime} min
      </p>
      <p className="font-mono text-sm leading-7">
        <span className="tracking-[2px]" aria-hidden="true">
          {dots}
        </span>{" "}
        {recipe.difficulty} · {detail}
      </p>
    </Link>
  );
}
