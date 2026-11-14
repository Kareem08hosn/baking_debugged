import { formatAmount } from "@/lib/recipes";

// One box in the row of key numbers at the top of a recipe.
function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-3">
      {/* <dt> is the term and <dd> its value, inside the <dl> list below */}
      <dt className="font-mono text-xs uppercase tracking-wide text-muted">
        {label}
      </dt>
      <dd className="font-mono text-lg font-bold">{value}</dd>
    </div>
  );
}

// Shows one full recipe. It is shared by the built-in recipes (drawn on the
// server) and the ones saved in the browser (drawn by SavedRecipe).
export default function RecipeDetail({ recipe }) {
  return (
    // <>...</> is a Fragment: it groups elements without adding an extra <div>
    <>
      <p className="mt-4 font-mono text-xs uppercase tracking-wide text-muted">
        {recipe.category} · {recipe.difficulty}
        {/* Only show the diets if the recipe has any */}
        {recipe.diet.length > 0 && ` · ${recipe.diet.join(", ")}`}
      </p>
      <h1 className="mt-1 font-mono text-3xl font-bold">{recipe.name}</h1>

      {/* Key numbers: 2 per row on phones, all 5 in one row from "sm" up */}
      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Stat label="Serves" value={recipe.servings} />
        <Stat label="Prep" value={`${recipe.prepTime} min`} />
        <Stat label="Bake" value={`${recipe.bakeTime} min`} />
        <Stat label="Total" value={`${recipe.prepTime + recipe.bakeTime} min`} />
        <Stat label="Rating" value={`★ ${recipe.rating}`} />
      </dl>

      {/* On phones the two sections stack. From "md" up they sit side by
          side: ingredients take 1 of 3 columns, instructions take 2. */}
      <div className="mt-8 grid gap-8 md:grid-cols-3">
        <section>
          <h2 className="mb-3 font-mono text-xl font-bold">Ingredients</h2>
          <ul className="rounded-lg border border-line bg-surface">
            {/* map() also hands us each item's position (index). It is safe
                to use as the key here because this list never reorders, and
                two ingredients could share a name. */}
            {recipe.ingredients.map((ingredient, index) => (
              // Name on the left, amount on the right, like a lab table.
              // last:border-b-0 removes the divider under the final row.
              <li
                key={index}
                className="flex justify-between gap-4 border-b border-line px-4 py-2 last:border-b-0"
              >
                <span>{ingredient.name}</span>
                <span className="whitespace-nowrap font-mono">
                  {formatAmount(ingredient)}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="md:col-span-2">
          <h2 className="mb-3 font-mono text-xl font-bold">Instructions</h2>
          <ol className="space-y-4">
            {recipe.instructions.map((step, index) => (
              <li key={index} className="flex gap-4">
                {/* Step number as 01, 02...: padStart adds a leading zero
                    until the text is 2 characters long */}
                <span className="font-mono font-bold text-muted">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </>
  );
}
