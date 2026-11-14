// The notebook's own substitution table: well-known swaps, written out with
// gram amounts and the chemistry. Works with no AI at all; the AI only
// handles what isn't here. No React: tested in lib/substitutions.test.js.
// [REVIEW] every amount below (typical values from baking references).
import { haveIngredient } from "./pantry.js";

//   from       ingredient names this replaces
//   to         what to use instead
//   works      "well", "okay" or "poorly"
//   topic      the chemistry note that explains it
export const SWAPS = [
  {
    id: "buttermilk",
    from: ["buttermilk"],
    to: "Milk with lemon juice or vinegar",
    amount: "For 240 g buttermilk: 225 g milk + 15 g lemon juice or white vinegar. Stir and leave 5 to 10 minutes.",
    works: "well",
    effect: "Slightly thinner than real buttermilk, but it bakes up almost the same.",
    chemistry: "The acid curdles the milk a little and, more importantly, supplies the acid that baking soda needs to make carbon dioxide.",
    topic: "leaveners",
  },
  {
    id: "baking-powder",
    from: ["baking powder"],
    to: "Baking soda with cream of tartar",
    amount: "For 1 tsp (about 4 g) baking powder: ¼ tsp (about 1.2 g) baking soda + ½ tsp (about 1.5 g) cream of tartar.",
    works: "well",
    effect: "Works like single-acting powder: it all reacts once wet, so bake straight away.",
    chemistry: "Baking powder is just soda plus a dry acid. Cream of tartar is that acid, minus the second, heat-activated one.",
    topic: "leaveners",
  },
  {
    id: "baking-soda",
    from: ["baking soda"],
    to: "Baking powder",
    amount: "About 3× the amount: for ½ tsp (about 3 g) baking soda, use 1½ tsp (about 6 g) baking powder.",
    works: "okay",
    effect: "Paler and a little less tender; large amounts can taste bitter.",
    chemistry: "Soda is about three times stronger and makes the batter less acidic, which speeds browning. Powder brings its own acid, so the batter stays more acidic and browns less.",
    topic: "leaveners",
  },
  {
    id: "self-raising",
    from: ["self-raising flour", "self-rising flour"],
    to: "All-purpose flour with baking powder and salt",
    amount: "For 120 g self-raising flour: 120 g all-purpose flour + 6 g (1½ tsp) baking powder + 1.5 g (¼ tsp) salt, whisked together.",
    works: "well",
    effect: "Very close to the real thing.",
    chemistry: "Self-raising flour is plain flour with leavener and salt already mixed in.",
    topic: "leaveners",
  },
  {
    id: "cake-flour",
    from: ["cake flour"],
    to: "All-purpose flour with cornstarch",
    amount: "For 120 g cake flour: 105 g all-purpose flour + 15 g cornstarch, sifted together twice.",
    works: "well",
    effect: "A softer, finer crumb than all-purpose alone.",
    chemistry: "Cornstarch has no gluten-forming protein, so swapping some flour for it lowers the protein, like cake flour.",
    topic: "gluten",
  },
  {
    id: "bread-flour",
    from: ["bread flour"],
    to: "All-purpose flour",
    amount: "Same weight. You may need a spoonful less water.",
    works: "okay",
    effect: "A slightly softer loaf with less rise and chew.",
    chemistry: "All-purpose flour has less protein, so it forms less gluten and holds less gas.",
    topic: "gluten",
  },
  {
    id: "butter-to-oil",
    from: ["butter"],
    to: "Neutral oil (in cakes, muffins and quick breads)",
    amount: "About 80% of the weight: for 100 g butter, use 80 g oil.",
    works: "okay",
    effect: "Moister and keeps longer, but denser and less buttery. Not for pastry, shortbread or most cookies.",
    chemistry: "Butter is about 80% fat and 16% water. Oil is pure fat and liquid, so it can’t hold air from creaming or make flaky layers.",
    topic: "fats",
  },
  {
    id: "oil-to-butter",
    from: ["oil", "vegetable oil"],
    to: "Melted butter",
    amount: "About 125% of the weight: for 80 g oil, use 100 g melted butter.",
    works: "well",
    effect: "More flavour and browning; slightly less moist after a day or two.",
    chemistry: "Butter is only about 80% fat, so more is needed for the same amount of fat. Its milk solids brown and add flavour.",
    topic: "fats",
  },
  {
    id: "egg-flax",
    from: ["egg"],
    to: "A flax egg",
    amount: "For 1 egg (about 50 g): 7 g ground flaxseed + 45 g water, stirred and left 5 minutes to thicken.",
    works: "okay",
    effect: "Fine for binding in muffins, cookies and quick breads. Poor in cakes that rely on eggs for lift and structure.",
    chemistry: "Flax makes a gel that binds like egg, but it doesn’t set firmly with heat or trap air the way egg proteins do.",
    topic: "eggs",
  },
  {
    id: "brown-sugar",
    from: ["brown sugar"],
    to: "White sugar with molasses",
    amount: "For 200 g light brown sugar: 185 g white sugar + 15 g molasses, rubbed together. Double the molasses for dark brown.",
    works: "well",
    effect: "Practically the same.",
    chemistry: "Brown sugar is white sugar coated in molasses, which adds moisture, flavour and a little acid.",
    topic: "sugar",
  },
  {
    id: "sour-cream",
    from: ["sour cream", "yogurt", "greek yogurt"],
    to: "Plain Greek yogurt (or sour cream)",
    amount: "Same weight.",
    works: "well",
    effect: "Yogurt is a little tangier and leaner; sour cream a little richer.",
    chemistry: "Both are thick, acidic dairy, so they add moisture and react with baking soda in the same way.",
    topic: "leaveners",
  },
  {
    id: "yeast",
    from: ["instant yeast", "active dry yeast"],
    to: "The other dried yeast",
    amount: "Use about 25% more active dry than instant (7 g instant ≈ 9 g active dry), and dissolve active dry in warm liquid first.",
    works: "well",
    effect: "Same bread; active dry may rise a little slower.",
    chemistry: "Active dry yeast has more dormant cells in a coarser granule, so it needs a bit more and a soak to wake up.",
    topic: "leaveners",
  },
  {
    id: "milk-powder",
    from: ["milk"],
    to: "Water with milk powder",
    amount: "For 240 g milk: 215 g water + 25 g nonfat milk powder.",
    works: "well",
    effect: "Nearly identical in baking.",
    chemistry: "Milk is mostly water plus milk solids (proteins and sugar), which is exactly what milk powder adds back.",
    topic: "browning",
  },
  {
    id: "honey",
    from: ["sugar"],
    to: "Honey",
    amount: "For 200 g sugar: about 250 g honey, about 60 g less liquid, ¼ tsp baking soda, and the oven 15 °C lower.",
    works: "okay",
    effect: "Moister, denser and browns faster, with honey flavour.",
    chemistry: "Honey is about 17% water and slightly acidic; it holds moisture and browns at lower temperatures than sugar.",
    topic: "sugar",
  },
  {
    id: "cocoa",
    from: ["cocoa", "dutch-process cocoa", "natural cocoa"],
    to: "The other kind of cocoa",
    amount: "Same weight in recipes with baking powder. With only baking soda, use natural cocoa, or swap the soda for 3× baking powder.",
    works: "okay",
    effect: "Dutch-process is darker and milder; natural is lighter and sharper.",
    chemistry: "Natural cocoa is acidic and can react with soda; Dutch-process has been neutralised, so it can’t.",
    topic: "leaveners",
  },
];

// The notebook swaps for an ingredient: "unsalted butter" finds the butter
// swap, but "peanut butter" doesn't (see haveIngredient in lib/pantry.js).
export function findSwaps(ingredient) {
  const text = String(ingredient ?? "").trim();
  if (text === "") {
    return [];
  }
  return SWAPS.filter((swap) => swap.from.some((name) => haveIngredient(text, [name])));
}
