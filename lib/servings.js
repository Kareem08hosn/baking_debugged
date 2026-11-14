// "Makes 24" or "serves 8"? Cookies, muffins and other bakes that come out
// as separate pieces are counted; a cake, a pie or a loaf is cut into
// portions. The recipe's "servings" number means whichever fits.

// Categories whose recipes come out as separate pieces.
const PIECE_CATEGORIES = [
  "cookies",
  "muffins",
  "buns",
  "bars",
  "scones",
  "pastry",
  "flatbread",
];

// Returns "makes" or "serves" for a recipe, to go in front of its number.
export function yieldWord(recipe) {
  return PIECE_CATEGORIES.includes(recipe.category) ? "makes" : "serves";
}
