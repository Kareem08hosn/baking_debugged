// The bake debugger: rules from baking chemistry that turn "what went
// wrong" into ranked likely causes, each with why it happens and what to
// change. This is Phase 5 v1: plain rules, no AI and no model yet (v2 will
// adjust the weights with what the Phase 4 model finds).
//
// No React, no database: tested in lib/debugger.test.js.
// Claims marked [REVIEW] are ones Kareem should double-check.

// What kind of bake it was. The symptoms depend on this.
export const BAKE_TYPES = [
  { id: "bread", label: "Yeasted bread" },
  { id: "cake", label: "Cake" },
  { id: "cookies", label: "Cookies" },
  { id: "muffins", label: "Muffins and quick breads" },
  { id: "pastry", label: "Pie and pastry" },
];

// What went wrong, per bake type.
export const SYMPTOMS = {
  bread: [
    { id: "dense", label: "Dense, tight crumb" },
    { id: "no-rise", label: "Barely rose at all" },
    { id: "flat", label: "Spread flat instead of up" },
    { id: "collapsed", label: "Collapsed or sank" },
    { id: "gummy", label: "Gummy or wet inside" },
    { id: "pale", label: "Pale crust" },
    { id: "dark", label: "Crust too dark or thick" },
    { id: "burst", label: "Burst open on the side" },
  ],
  cake: [
    { id: "sank", label: "Sank in the middle" },
    { id: "domed", label: "Domed and cracked" },
    { id: "dense", label: "Dense or heavy" },
    { id: "dry", label: "Dry" },
    { id: "tough", label: "Tough or rubbery, with tunnels" },
    { id: "burnt-edges", label: "Burnt edges or bottom" },
  ],
  cookies: [
    { id: "spread", label: "Spread too thin" },
    { id: "no-spread", label: "Didn’t spread, puffy or cakey" },
    { id: "hard", label: "Too hard" },
    { id: "pale", label: "Too pale" },
    { id: "burnt-bottoms", label: "Burnt bottoms" },
  ],
  muffins: [
    { id: "tough", label: "Tough, with tunnels inside" },
    { id: "peaked", label: "Pointed, peaked tops" },
    { id: "sank", label: "Sank in the middle" },
    { id: "dense", label: "Dense, didn’t rise much" },
    { id: "dry", label: "Dry" },
  ],
  pastry: [
    { id: "tough", label: "Tough crust" },
    { id: "shrank", label: "Shrank in the pan" },
    { id: "not-flaky", label: "Not flaky" },
    { id: "soggy", label: "Soggy bottom" },
    { id: "runny", label: "Runny filling" },
  ],
};

// The rules. Each one is a possible cause:
//   types, symptoms  when it applies (any of the symptoms)
//   base             how likely it is on its own (1 to 3)
//   topic            the chemistry note that explains it
export const RULES = [
  // ----- Yeasted bread -----
  {
    id: "bread-underproofed",
    types: ["bread"],
    symptoms: ["dense", "no-rise", "burst"],
    cause: "Under-proofed: not enough rising time",
    why: "Yeast needs time to fill the dough with gas. Cut short, the crumb is tight, and the loaf can tear open in the oven as it makes up for it all at once.",
    fix: "Go by the dough, not the clock: it should roughly double, and a floured fingertip dent should spring back slowly.",
    topic: "leaveners",
    base: 2,
  },
  {
    id: "bread-yeast-dead",
    types: ["bread"],
    symptoms: ["no-rise", "dense"],
    cause: "The yeast was dead or weak",
    why: "Old yeast, or liquid hot enough to hurt it (roughly 50 °C and up), leaves little to make gas.",
    fix: "Use lukewarm liquid and check the date. To test yeast, stir it into warm water with a pinch of sugar: it should foam within 10 minutes.",
    topic: "leaveners",
    base: 1,
  },
  {
    id: "bread-weak-gluten",
    types: ["bread"],
    symptoms: ["dense", "flat"],
    cause: "Gluten not developed enough",
    why: "Under-kneaded dough can’t hold its gas, so it tears and slumps instead of rising.",
    fix: "Knead or fold until a small piece stretches thin enough to see light through (the windowpane test).",
    topic: "gluten",
    base: 1,
  },
  {
    id: "bread-low-hydration",
    types: ["bread"],
    symptoms: ["dense"],
    cause: "Dough too dry",
    why: "Too little water makes a stiff dough that can’t expand much, and a tight crumb.",
    fix: "Add water a spoonful at a time until the dough is soft and slightly tacky.",
    topic: "hydration",
    base: 1,
  },
  {
    id: "bread-overproofed",
    types: ["bread"],
    symptoms: ["flat", "collapsed"],
    cause: "Over-proofed: risen too long",
    why: "Left too long, the gluten weakens and the yeast runs low on food, so the dough can’t hold its shape and sinks in the oven.",
    fix: "Bake when a fingertip dent springs back slowly. If it doesn’t spring back at all, reshape it and give it a short second rise.",
    topic: "leaveners",
    base: 2,
  },
  {
    id: "bread-too-wet",
    types: ["bread"],
    symptoms: ["flat", "gummy"],
    cause: "Dough wetter than it can support",
    why: "High-hydration doughs need strong gluten and tight shaping to stand up; otherwise they spread.",
    fix: "Drop the water by about 5%, or bake it in a tin until it feels easier to handle.",
    topic: "hydration",
    base: 1,
  },
  {
    id: "bread-underbaked",
    types: ["bread"],
    symptoms: ["gummy", "pale", "collapsed"],
    cause: "Underbaked, or cut while hot",
    why: "The crumb keeps setting as it cools. Underbaked or sliced early, the starch is still wet and gummy.",
    fix: "Bake to an internal temperature (about 88 °C for soft, enriched loaves, 95 °C for lean ones) and cool at least an hour before slicing.",
    topic: "oven",
    base: 2,
  },
  {
    id: "bread-oven-cool",
    types: ["bread"],
    symptoms: ["pale", "flat"],
    cause: "Oven cooler than it says",
    why: "Bread needs strong heat for oven spring and browning. Many home ovens run 10 to 25 °C off.",
    fix: "Put an oven thermometer on the middle rack, preheat a full 20 minutes, and adjust the dial to match.",
    topic: "oven",
    base: 1,
  },
  {
    id: "bread-oven-hot",
    types: ["bread"],
    symptoms: ["dark"],
    cause: "Oven too hot, or too much sugar",
    why: "Browning speeds up fast at high heat, and sugar, milk and honey brown sooner still.",
    fix: "Lower the oven by about 15 °C, or lay foil loosely over the top once it’s coloured.",
    topic: "browning",
    base: 2,
  },
  {
    id: "bread-no-scoring",
    types: ["bread"],
    symptoms: ["burst"],
    cause: "No room to expand",
    why: "In the oven the loaf expands fast. Without a cut on top, it breaks out at the weakest point, usually the side.",
    fix: "Score the top about 1 cm deep with a sharp blade just before baking.",
    topic: "oven",
    base: 1,
  },

  // ----- Cake -----
  {
    id: "cake-underbaked",
    types: ["cake"],
    symptoms: ["sank"],
    cause: "Underbaked, or the oven runs cool",
    why: "The middle sets last. Taken out before it sets, or baked too cool to set in time, it sinks as it cools.",
    fix: "Bake until a skewer comes out clean and the top springs back. Check the oven with a thermometer.",
    topic: "oven",
    base: 2,
  },
  {
    id: "cake-door-opened",
    types: ["cake", "muffins"],
    symptoms: ["sank"],
    cause: "Oven door opened too early",
    why: "Opening the door drops the temperature while the structure is still soft, and the rising batter falls.",
    fix: "Keep the door shut for the first two thirds of the baking time.",
    topic: "oven",
    base: 1,
  },
  {
    id: "cake-too-much-leavener",
    types: ["cake", "muffins"],
    symptoms: ["sank"],
    cause: "Too much baking powder or soda",
    why: "Too much gas inflates the bubbles past what the batter can hold, so they burst and the cake collapses.",
    fix: "Measure leaveners with proper measuring spoons, levelled off, or weigh them.",
    topic: "leaveners",
    base: 1,
  },
  {
    id: "cake-oven-hot",
    types: ["cake", "muffins"],
    symptoms: ["domed", "peaked", "burnt-edges"],
    cause: "Oven too hot",
    why: "The outside sets before the middle has finished rising, so the middle pushes up and cracks the crust.",
    fix: "Check the oven with a thermometer, and lower a fan oven by about 15 to 20 °C.",
    topic: "oven",
    base: 2,
  },
  {
    id: "cake-too-much-flour",
    types: ["cake", "muffins"],
    symptoms: ["domed", "dense", "dry"],
    cause: "Too much flour",
    why: "Extra flour makes a stiffer batter that rises to a peak, bakes up dense and soaks up moisture.",
    fix: "Weigh the flour. If you use cups, spoon the flour in and level it instead of scooping.",
    topic: "gluten",
    base: 1,
  },
  {
    id: "cake-creaming",
    types: ["cake"],
    symptoms: ["dense"],
    cause: "Butter couldn’t hold air",
    why: "Creaming traps air in solid butter. Butter that’s too soft or melted can’t hold those bubbles, so there’s less for the leavener to inflate.",
    fix: "Use butter that dents when pressed but isn’t shiny (about 18 to 20 °C), and cream it with the sugar until pale and fluffy.",
    topic: "fats",
    base: 1,
  },
  {
    id: "cake-old-leavener",
    types: ["cake", "muffins", "cookies"],
    symptoms: ["dense", "no-spread"],
    cause: "Old baking powder or soda",
    why: "Leaveners lose strength after the tin is opened, especially in a humid kitchen.",
    fix: "Test it: baking powder should fizz hard in hot water, baking soda in vinegar. Replace it if not.",
    topic: "leaveners",
    base: 1,
  },
  {
    id: "cake-overmixed",
    types: ["cake", "muffins"],
    symptoms: ["tough", "peaked", "dense"],
    cause: "Overmixed after the flour went in",
    why: "Mixing wet flour builds gluten. In a cake or muffin that means a tough, chewy crumb with long tunnels.",
    fix: "Once the flour is in, stir only until it disappears. A few lumps are fine.",
    topic: "gluten",
    base: 2,
  },
  {
    id: "cake-overbaked",
    types: ["cake", "muffins"],
    symptoms: ["dry", "burnt-edges"],
    cause: "Overbaked",
    why: "Every extra minute drives off water. Thin edges dry out and brown first.",
    fix: "Start checking 5 to 10 minutes before the recipe says, and take it out as soon as a skewer comes out clean.",
    topic: "oven",
    base: 2,
  },
  {
    id: "dark-pan",
    types: ["cake", "cookies", "muffins"],
    symptoms: ["burnt-edges", "burnt-bottoms"],
    cause: "Dark pan, or rack too low",
    why: "Dark metal absorbs more of the oven’s heat, and the bottom element is closest to the lowest rack.",
    fix: "Bake on the middle rack. With a dark pan, lower the oven by about 10 to 15 °C or line it with parchment.",
    topic: "browning",
    base: 2,
  },

  // ----- Cookies -----
  {
    id: "cookies-warm-butter",
    types: ["cookies"],
    symptoms: ["spread"],
    cause: "Butter too warm",
    why: "The softer the fat, the sooner the dough melts in the oven, so it spreads before the edges set.",
    fix: "Use butter that’s cool and dents when pressed, not greasy, and chill the scooped dough.",
    topic: "fats",
    base: 2,
  },
  {
    id: "cookies-not-chilled",
    types: ["cookies"],
    symptoms: ["spread"],
    cause: "Dough not chilled",
    why: "Warm dough melts and spreads before the eggs and flour set the edges. Chilling also lets the flour soak up liquid.",
    fix: "Chill the dough for at least 30 minutes, and put it on a cool tray.",
    topic: "fats",
    base: 1,
  },
  {
    id: "cookies-sugar",
    types: ["cookies"],
    symptoms: ["spread", "hard"],
    cause: "Too much sugar, especially white",
    why: "Sugar turns to syrup in the oven and loosens the dough. More white sugar means wider, flatter, crisper cookies.",
    fix: "Weigh the sugar. For softer, thicker cookies, swap some white sugar for brown.",
    topic: "sugar",
    base: 1,
  },
  {
    id: "cookies-too-much-flour",
    types: ["cookies"],
    symptoms: ["no-spread"],
    cause: "Too much flour",
    why: "A scooped cup of flour can weigh 20% more than a spooned one. Extra flour makes a stiff dough that stays in a ball and bakes cakey.",
    fix: "Weigh the flour, or spoon it into the cup and level it off.",
    topic: "gluten",
    base: 2,
  },
  {
    id: "cookies-overbaked",
    types: ["cookies"],
    symptoms: ["hard"],
    cause: "Baked too long",
    why: "Cookies keep baking on the hot tray. Taken out when they look done, they end up hard once cool.",
    fix: "Take them out when the edges are set but the middles still look a little underdone.",
    topic: "oven",
    base: 2,
  },
  {
    id: "cookies-pale",
    types: ["cookies"],
    symptoms: ["pale"],
    cause: "Oven cool, or an acidic dough",
    why: "Browning needs heat, and it goes faster when the dough is less acidic. Baking powder in place of soda gives paler cookies.",
    fix: "Check the oven with a thermometer, and keep the leavener the recipe asks for.",
    topic: "browning",
    base: 2,
  },

  // ----- Pie and pastry -----
  {
    id: "pastry-overworked",
    types: ["pastry"],
    symptoms: ["tough", "shrank"],
    cause: "Dough overworked",
    why: "Every bit of mixing and rolling builds gluten. Strong gluten makes a tough crust that springs back and shrinks.",
    fix: "Mix just until the dough holds together, and handle it as little as you can.",
    topic: "gluten",
    base: 2,
  },
  {
    id: "pastry-not-rested",
    types: ["pastry"],
    symptoms: ["shrank"],
    cause: "Dough not rested, or stretched into the pan",
    why: "Freshly rolled gluten is tight. Stretched to fit the pan, it pulls back as it bakes.",
    fix: "Rest the dough in the fridge for 30 minutes before rolling and again in the pan. Ease it in; don’t stretch it.",
    topic: "gluten",
    base: 2,
  },
  {
    id: "pastry-warm-butter",
    types: ["pastry"],
    symptoms: ["not-flaky", "tough", "shrank"],
    cause: "Butter got too warm",
    why: "Flakes come from separate pieces of cold butter turning to steam in the oven. Warm butter blends into the flour instead.",
    fix: "Keep everything cold, leave the butter in visible pieces, and chill the dough again whenever it softens.",
    topic: "fats",
    base: 2,
  },
  {
    id: "pastry-soggy",
    types: ["pastry"],
    symptoms: ["soggy"],
    cause: "Bottom not hot enough",
    why: "A wet filling keeps the base below 100 °C, so it steams instead of crisping.",
    fix: "Bake on the lowest rack on a preheated tray, and blind-bake the shell first for wet fillings.",
    topic: "browning",
    base: 2,
  },
  {
    id: "pastry-runny",
    types: ["pastry"],
    symptoms: ["runny"],
    // [REVIEW] starch thickeners need to boil to thicken fully
    cause: "Filling didn’t get hot enough to thicken, or was cut warm",
    why: "Starch thickeners like cornstarch and flour only thicken fully once the filling bubbles, and they keep setting as it cools.",
    fix: "Bake until the filling bubbles in the middle, not just the edges, then cool for several hours before slicing.",
    topic: "oven",
    base: 2,
  },
];

// Words for how strongly the answers point at a cause.
function likelihood(score) {
  if (score >= 4) return "Most likely";
  if (score >= 2) return "Possible";
  return "Less likely";
}

// The heart of it. Given a bake type and the chosen symptom ids, returns
// the matching causes, best first:
//   [{ id, cause, why, fix, topic, score, likelihood, reasons: [...] }]
// A rule's score is its base, plus 1 for every extra symptom it explains.
export function diagnose(type, symptoms) {
  const results = [];
  for (const rule of RULES) {
    const matched = rule.symptoms.filter((symptom) => symptoms.includes(symptom));
    if (!rule.types.includes(type) || matched.length === 0) {
      continue;
    }
    const score = rule.base + (matched.length - 1);
    results.push({
      id: rule.id,
      cause: rule.cause,
      why: rule.why,
      fix: rule.fix,
      topic: rule.topic,
      score,
      likelihood: likelihood(score),
      // Only worth saying when it is the reason for ranking higher.
      reasons:
        matched.length > 1
          ? [`It explains ${matched.length} of the things that went wrong.`]
          : [],
    });
  }
  // Highest score first; ties keep the order of the rules list.
  return results.toSorted((a, b) => b.score - a.score);
}
