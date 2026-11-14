import BakeDebugger from "@/components/debugger/BakeDebugger";
import { isAiEnabled } from "@/lib/ai/config";
import { getMyBake } from "@/lib/journal";
import { getOwnRecipe, getRecipeById } from "@/lib/recipes";

export const metadata = {
  title: "Bake debugger",
  description: "Tell it what went wrong with your bake. It ranks the likely causes from baking chemistry and says what to change.",
};

// Which debugger bake type a recipe category belongs to.
const TYPE_FOR_CATEGORY = {
  bread: "bread",
  buns: "bread",
  flatbread: "bread",
  cake: "cake",
  cookies: "cookies",
  bars: "cookies",
  muffins: "muffins",
  "quick bread": "muffins",
  scones: "muffins",
  pie: "pastry",
  pastry: "pastry",
};

// /debugger, or /debugger?bake=12 to start from a logged bake: the bake
// type comes from its recipe, and its hydration and notes are filled in.
export default async function DebuggerPage({ searchParams }) {
  const { bake: bakeId } = await searchParams;
  let initialType = "";
  let initialDetails = {};
  let note = null;

  const bake = bakeId ? await getMyBake(bakeId) : null;
  if (bake) {
    const recipe = bake.recipeId
      ? ((await getRecipeById(bake.recipeId)) ?? (await getOwnRecipe(bake.recipeId)))
      : null;
    initialType = TYPE_FOR_CATEGORY[recipe?.category] ?? "";
    if (bake.hydrationPct !== null) {
      initialDetails = { hydrationPct: String(bake.hydrationPct) };
    }
    note = bake.whatWentWrong;
  }

  return (
    <main className="page pt-6">
      <h1 className="font-mono text-[clamp(2.6rem,11vw,4.5rem)] font-extrabold leading-none tracking-[-0.05em]">
        <span className="highlight">Bake debugger</span>
      </h1>
      <p className="mt-4 max-w-xl text-lg">
        Tell it what went wrong. It ranks the likely causes, shows which of
        your answers pointed there, and says what to change next time.
      </p>
      {bake && (
        <p className="mt-2 font-mono text-sm text-muted">
          Debugging: {bake.title}, {bake.bakedOn}
        </p>
      )}
      <div className="mt-10">
        <BakeDebugger initialType={initialType} initialDetails={initialDetails} note={note} aiEnabled={isAiEnabled()} />
      </div>
    </main>
  );
}
