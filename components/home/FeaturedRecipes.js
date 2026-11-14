import Link from "next/link";
import RecipeCard from "@/components/RecipeCard";

// Where each of the three cards sits. On phones they zig-zag down the page
// (left, right, centre); from "md" up they share a row, each starting at a
// slightly different height, like notes pinned up by hand.
const PLACEMENT = [
  "",
  "justify-self-end md:mt-9",
  "justify-self-center md:mt-3",
];

// "On the bench": a few featured recipes. "total" is how many recipes the
// site has, for the link underneath.
export default function FeaturedRecipes({ recipes, total }) {
  if (recipes.length === 0) {
    return null; // returning null draws nothing
  }

  // some() is true if at least one item passes the test.
  const hasUntested = recipes.some((recipe) => recipe.tested === false);

  return (
    <section className="page pb-18">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-2">
        <h2 className="section-title">
          <span className="highlight">On the bench</span>
        </h2>
        {hasUntested && (
          <p className="hand max-w-64 -rotate-[1.5deg] text-muted">
            dashed stamp = adapted, not test-baked here yet
          </p>
        )}
      </div>

      <ul className="grid gap-9 md:grid-cols-3 md:gap-6">
        {recipes.map((recipe, index) => (
          <li
            key={recipe.id}
            className={`w-full max-w-84 md:max-w-none md:justify-self-auto ${PLACEMENT[index] ?? ""}`}
          >
            <RecipeCard recipe={recipe} position={index} />
          </li>
        ))}
      </ul>

      <Link href="/recipes" className="link mt-9 inline-block">
        See all {total} recipes
      </Link>
    </section>
  );
}
