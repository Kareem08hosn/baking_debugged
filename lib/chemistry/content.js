// The text of each chemistry explainer, keyed by slug (see topics.js for
// the list and the recipe matching).
//
// Shape of one explainer:
//   lead          one or two sentences under the title
//   sections      [{ heading, paragraphs: [...] }], the explanation
//   numbers       [{ label, value }], key figures shown in monospace
//   failures      [{ cause, result, fix }], the "What goes wrong if..." list
//   diagramLabel  what the diagram shows, read out to screen readers
//
// Claims marked [REVIEW] in a comment are ones Kareem should double-check.
// Figures are typical values from common baking references, rounded.

export const CONTENT = {
  leaveners: {
    lead: "All three fill a batter or dough with carbon dioxide. They differ in what sets them off and how fast they work.",
    sections: [
      {
        heading: "Baking soda needs an acid",
        paragraphs: [
          "Baking soda is sodium bicarbonate, a base. On its own it does very little. Mixed with something acidic and wet, such as buttermilk, yogurt, brown sugar, honey, natural cocoa or lemon juice, it gives off carbon dioxide straight away.",
          "Because it is a base, soda also makes the batter less acidic. That speeds up browning, which is why soda-raised cookies come out darker. Too much of it, with not enough acid to use it up, tastes soapy or metallic.",
        ],
      },
      {
        heading: "Baking powder brings its own acid",
        paragraphs: [
          "Baking powder is baking soda already mixed with dry acids, plus a little starch to keep it dry in the tin. Add water and the two react, so it works in recipes with no acidic ingredients.",
          "Most supermarket powder is double-acting: one acid reacts as soon as it gets wet, and a second one only reacts in the heat of the oven. The second burst is why a powder batter can wait a little before baking.",
        ],
      },
      {
        heading: "Yeast is alive",
        paragraphs: [
          "Yeast is a single-celled fungus. It eats sugars in the dough and gives off carbon dioxide and alcohol. It is slow, hours instead of minutes, and that time is also where bread gets most of its flavour.",
          "Yeast likes warmth: a dough around 24 to 27 °C rises steadily. In the oven it works faster for a few minutes, then dies as the dough heats up. That last push, together with gas and steam expanding, is called oven spring.",
        ],
      },
    ],
    numbers: [
      // [REVIEW] usual rule of thumb; strengths vary by brand
      { label: "Baking powder", value: "≈ 1 tsp per 120 g flour" },
      { label: "Baking soda", value: "≈ ¼ tsp per 120 g flour" },
      // [REVIEW] 3 to 4 times is the usual range quoted
      { label: "Soda vs powder", value: "soda ≈ 3–4× stronger" },
      // [REVIEW] yeast dies around 60 °C; liquid above ~50 °C can harm it
      { label: "Yeast dies at", value: "≈ 60 °C" },
    ],
    failures: [
      {
        cause: "you swap them 1:1",
        result: "Soda in place of powder over-leavens and tastes soapy. Powder in place of soda barely rises and browns less.",
        // [REVIEW] the cream of tartar ratio is the usual home substitute
        fix: "Replacing soda takes about 3× as much powder. Replacing 1 tsp powder takes ¼ tsp soda plus an acid, such as ½ tsp cream of tartar.",
      },
      {
        cause: "a soda batter sits on the counter",
        result: "The gas escapes before the oven can set the crumb, so it bakes up dense.",
        fix: "Get soda batters into a hot oven soon after mixing.",
      },
      {
        cause: "the baking powder is old",
        result: "Little or no rise. Powder loses strength once the tin has been opened for a while.",
        fix: "Test it: a spoonful in hot water should fizz hard.",
      },
      {
        cause: "the water for the yeast is too hot",
        result: "The yeast dies and the dough never rises.",
        fix: "Use lukewarm liquid. If it feels hot on your wrist, let it cool.",
      },
    ],
    diagramLabel:
      "Sketch of gas release over time. Baking soda with acid gives one burst at mixing. Double-acting baking powder gives a small burst at mixing and a bigger one in the oven.",
  },

  gluten: {
    lead: "Wheat flour plus water plus mixing makes gluten: a stretchy network that traps gas. Bread wants a lot of it. Cakes and muffins want as little as possible.",
    sections: [
      {
        heading: "Two proteins, one network",
        paragraphs: [
          "Wheat flour contains two proteins, glutenin and gliadin. When they get wet they link up into gluten. Glutenin makes the network springy, so it snaps back. Gliadin lets it stretch.",
          "Kneading lines the strands up and makes the network stronger. Time does some of the same work on its own, which is how no-knead breads get away with a few folds and a long rest.",
        ],
      },
      {
        heading: "More protein, more gluten",
        paragraphs: [
          "Flours are sold by how much protein they have. Bread flour has the most, so it gives a chewier, taller loaf. Cake flour has the least, for a soft, fine crumb.",
          "Other ingredients get in the way of gluten. Fat coats the proteins (that is where the word shortening comes from). Sugar competes with them for water. Salt does the opposite and tightens the network.",
        ],
      },
      {
        heading: "Relaxing",
        paragraphs: [
          "Freshly worked gluten is tight and fights back when you try to shape it. Left alone for 10 to 20 minutes, it relaxes and stretches easily again.",
        ],
      },
    ],
    numbers: [
      // [REVIEW] protein ranges vary by country and brand
      { label: "Cake flour", value: "≈ 7–9 % protein" },
      { label: "All-purpose", value: "≈ 10–12 % protein" },
      { label: "Bread flour", value: "≈ 12–14 % protein" },
    ],
    failures: [
      {
        cause: "you beat a muffin batter smooth",
        result: "Tough, chewy muffins with long tunnels inside.",
        fix: "Stir until the flour just disappears. Lumps are fine.",
      },
      {
        cause: "a bread dough is under-kneaded",
        result: "It tears instead of stretching, can’t hold its gas, and bakes up flat and dense.",
        fix: "Knead until a small piece stretches thin enough to let light through without tearing (the windowpane test).",
      },
      {
        cause: "the dough keeps shrinking back as you shape it",
        result: "Uneven shapes, and pizza or rolls that won’t stay stretched.",
        fix: "Cover it and walk away for 15 minutes, then try again.",
      },
      {
        cause: "pie dough is worked too much",
        result: "A tough crust that shrinks in the pan.",
        fix: "Mix just until it holds together, and rest it in the fridge before rolling.",
      },
    ],
    diagramLabel:
      "Sketch of gluten. Just after mixing the proteins are short tangled strands. After kneading they form long aligned strands with gas bubbles trapped between them.",
  },

  hydration: {
    lead: "Bakers write every ingredient as a percentage of the flour. Hydration is the water’s share, and it predicts how a dough will feel and bake.",
    sections: [
      {
        heading: "Flour is always 100 %",
        paragraphs: [
          "In baker’s percentages the flour is 100 % and everything else is measured against it. A dough with 500 g flour and 350 g water is 70 % hydration. The numbers stay the same at any batch size, which is why bakers use them.",
          "On this site, milk counts for the water it contains (about 87 %), and a sourdough starter counts as half flour, half water. Eggs and butter are left out, the usual convention.",
        ],
      },
      {
        heading: "What the number tells you",
        paragraphs: [
          "Low hydration doughs are stiff and easy to shape, and bake into a tight, even crumb: bagels, sandwich loaves. High hydration doughs are slack and sticky, but the extra water turns to steam and gives big, open holes: ciabatta, many sourdoughs.",
          "Not every flour drinks the same. Whole wheat flour soaks up more water than white, so a whole wheat dough at the same hydration feels stiffer and bakes drier.",
        ],
      },
    ],
    numbers: [
      // [REVIEW] typical ranges
      { label: "Bagels", value: "≈ 55–58 %" },
      { label: "Sandwich loaf", value: "≈ 60–65 %" },
      { label: "Rustic loaf", value: "≈ 70–75 %" },
      { label: "Ciabatta", value: "≈ 75–85 %" },
    ],
    failures: [
      {
        cause: "the hydration is too low for the bread",
        result: "A dense, tight crumb and a dough that tears when shaped.",
        fix: "Add water a spoonful at a time until the dough feels soft and slightly tacky.",
      },
      {
        cause: "the hydration is higher than you can handle yet",
        result: "The dough spreads flat on the tray and the inside can be gummy.",
        fix: "Drop 5 % of the water next time, or bake it in a tin.",
      },
      {
        cause: "you swap in whole wheat flour without adding water",
        result: "A dry, crumbly brick.",
        fix: "Add roughly 5 to 10 % more water and let the dough rest so the bran can soak.",
      },
    ],
    diagramLabel:
      "Three dough balls side by side. At 58 % hydration it stands tall, at 70 % it slumps a little, at 85 % it spreads into a low puddle.",
  },

  sugar: {
    lead: "Sugar sweetens, but it also holds on to water, keeps bakes tender, helps trap air and turns brown. Cutting it changes much more than the taste.",
    sections: [
      {
        heading: "It holds water",
        paragraphs: [
          "Sugar attracts and holds water. That keeps cakes moist and slows them going stale. Brown sugar, which contains molasses, holds even more, which is why it makes softer, chewier cookies.",
        ],
      },
      {
        heading: "It keeps things tender",
        paragraphs: [
          "Sugar competes with flour for water, so less gluten forms. It also makes egg proteins and starch set at a higher temperature. The batter stays fluid a little longer in the oven, rises more, and ends up softer.",
        ],
      },
      {
        heading: "It traps air and spreads",
        paragraphs: [
          "When you cream butter and sugar, the sharp sugar crystals cut thousands of tiny air pockets into the butter. Those pockets become the bubbles that the leavener inflates.",
          "In the oven, sugar dissolves into a syrup and the dough loosens. More sugar, especially white sugar, means cookies spread wider and bake crisper.",
        ],
      },
      {
        heading: "It turns brown",
        paragraphs: [
          "Sugar takes part in browning in two ways: on its own (caramelisation) and together with proteins (the Maillard reaction). See the browning note for the details.",
        ],
      },
    ],
    numbers: [
      // [REVIEW] sucrose caramelisation start, commonly quoted
      { label: "Table sugar caramelises", value: "≈ 160 °C and up" },
      { label: "Brown sugar", value: "white sugar + molasses" },
    ],
    failures: [
      {
        cause: "you halve the sugar in a cake",
        result: "Drier, paler, tougher, and stale by the next day.",
        fix: "Cut by a quarter at most, or choose a recipe written to be less sweet.",
      },
      {
        cause: "there’s too much sugar",
        result: "The cake rises, then sinks in the middle. Cookies spread thin and burn at the edges.",
        fix: "Weigh the sugar. A cup measure can be off by a lot.",
      },
      {
        cause: "you use all brown sugar instead of white",
        result: "Softer, chewier, darker cookies. The molasses is acidic, so it also reacts with any baking soda.",
        fix: "That might be what you want. For crisp cookies, keep more white sugar.",
      },
      {
        cause: "a sweet dough rises very slowly",
        result: "Lots of sugar pulls water away from the yeast and slows it down.",
        fix: "Give it more time, or use a bit more yeast as rich dough recipes do.",
      },
    ],
    diagramLabel:
      "Sketch of creaming: a blob of butter with sugar crystals cutting small air pockets into it.",
  },

  fats: {
    lead: "Fat makes bakes tender by getting between the flour proteins. Which fat you use, and how cold it is, decides whether you get flaky, fluffy or moist.",
    sections: [
      {
        heading: "Butter is not just fat",
        paragraphs: [
          "Butter is about 80 % fat, 16 % water and a little milk protein and sugar. The water turns to steam in the oven. The milk solids brown and give butter its flavour.",
          "Oil is pure fat and stays liquid at room temperature. It can’t hold air the way butter can, but it coats flour very well and keeps cakes soft and moist for days, even from the fridge.",
        ],
      },
      {
        heading: "Temperature changes everything",
        paragraphs: [
          "Cold, solid pieces of butter make flaky pastry. They stay in separate pieces as the dough is rolled, and in the oven their water turns to steam and pushes the layers apart.",
          "Softened butter, cool but bendable, is what you need for creaming: it’s firm enough to hold the air pockets the sugar cuts into it. Melted butter can’t hold air at all, which gives denser, chewier results.",
        ],
      },
    ],
    numbers: [
      // [REVIEW] typical North American butter; European styles run ~82 %+
      { label: "Butter", value: "≈ 80 % fat, 16 % water" },
      { label: "Oil", value: "100 % fat" },
      // [REVIEW] usual guidance for "softened"
      { label: "Softened butter", value: "≈ 18–20 °C" },
      // [REVIEW] rule of thumb, cake will be less fluffy
      { label: "Oil for butter", value: "use ≈ 80 % of the weight" },
    ],
    failures: [
      {
        cause: "the butter in pie dough gets warm",
        result: "No flakes, a greasy crust, and shrinking in the pan.",
        fix: "Keep everything cold. Chill the dough again whenever the butter starts to look soft.",
      },
      {
        cause: "the butter is too soft when creaming",
        result: "The mixture can’t hold air: a dense cake, or cookies that spread flat.",
        fix: "Butter should dent when pressed but not look shiny or greasy.",
      },
      {
        cause: "you swap oil for butter in a creamed cake",
        result: "Moist but denser, with less flavour.",
        fix: "Choose a cake written for oil instead of converting a butter one.",
      },
      {
        cause: "you brown the butter and use the same weight",
        result: "Browning boils off the water, so the dough is a little drier and stiffer.",
        fix: "Add back a spoonful or two of water or milk.",
      },
    ],
    diagramLabel:
      "Cross-section of pie dough. Before baking, flat pieces of butter sit between layers of dough. In the oven their water turns to steam and pushes the layers apart into flakes.",
  },

  eggs: {
    lead: "Eggs set the structure of a bake, can trap air, add richness, and hold fat and water together in one smooth batter.",
    sections: [
      {
        heading: "The white and the yolk do different jobs",
        paragraphs: [
          "The white is mostly water and protein. Whipped, it holds a lot of air, which is how meringues and sponge cakes rise. The yolk carries the fat, the flavour, and lecithin, an emulsifier.",
          "An emulsifier lets fat and water mix when they normally wouldn’t. That is why a well-made cake batter looks smooth and creamy, not greasy.",
        ],
      },
      {
        heading: "Heat sets them",
        paragraphs: [
          "Egg proteins start out folded up in tight balls. Heat makes them unfold and link to each other into a firm network, which sets the crumb around the bubbles. The white sets at a lower temperature than the yolk.",
        ],
      },
    ],
    numbers: [
      // [REVIEW] large egg weights without shell, approximate
      { label: "Large egg, no shell", value: "≈ 50 g" },
      { label: "White / yolk", value: "≈ 30 g / 18 g" },
      // [REVIEW] approximate setting ranges
      { label: "Whites set", value: "≈ 62–65 °C" },
      { label: "Yolks set", value: "≈ 65–70 °C" },
    ],
    failures: [
      {
        cause: "there are too few eggs",
        result: "A crumbly cake that sinks or falls apart when cut.",
        fix: "Weigh eggs if a recipe gives grams: sizes vary a lot.",
      },
      {
        cause: "there are too many eggs",
        result: "A rubbery, springy texture that tastes eggy.",
        fix: "Stick to the recipe’s weight, not just the count.",
      },
      {
        cause: "cold eggs go into creamed butter",
        result: "The batter curdles and looks broken. It bakes a little denser.",
        fix: "Use eggs at room temperature and add them one at a time.",
      },
      {
        cause: "a speck of yolk gets into the whites",
        result: "The whites won’t whip up. Fat stops the proteins holding air.",
        fix: "Separate each egg over a small bowl before adding it to the rest.",
      },
    ],
    diagramLabel:
      "Sketch of egg proteins. Before heating they are tight coils. After heating they unfold and link into a net.",
  },

  browning: {
    lead: "A golden crust is two different reactions: the Maillard reaction between sugars and proteins, and caramelisation of sugar on its own. Both need a surface hotter than boiling water.",
    sections: [
      {
        heading: "Maillard: sugar meets protein",
        paragraphs: [
          "When proteins and certain sugars are heated together, they react and make brown colour and hundreds of flavour compounds: the taste of toast, crust and roasted coffee. It speeds up a lot once the surface goes above about 140 °C.",
          "Milk, eggs and butter add proteins and sugars, which is why enriched breads like brioche brown so quickly. A less acidic surface browns faster too. Pretzels are dipped in an alkaline bath before baking for their deep brown skin.",
        ],
      },
      {
        heading: "Caramelisation: sugar on its own",
        paragraphs: [
          "Heat sugar far enough and it breaks down into caramel: brown, nutty, then bitter. Table sugar needs a lot of heat for this, around 160 °C and above.",
        ],
      },
      {
        heading: "Why the inside stays pale",
        paragraphs: [
          "Water can’t get hotter than 100 °C while it is evaporating. As long as a surface is wet, it stays too cool to brown. The crust browns only once it dries out, while the moist inside never gets there.",
        ],
      },
    ],
    numbers: [
      { label: "Water boils", value: "100 °C" },
      // [REVIEW] commonly quoted thresholds
      { label: "Maillard speeds up", value: "≈ 140 °C and up" },
      { label: "Table sugar caramelises", value: "≈ 160 °C and up" },
    ],
    failures: [
      {
        cause: "the crust stays pale",
        result: "Bland flavour, even when the inside is baked through.",
        fix: "Check the oven with a thermometer. A milk or egg wash also helps.",
      },
      {
        cause: "the top browns long before the middle is done",
        result: "A dark outside around a raw centre.",
        fix: "Lower the oven by about 15 °C, or lay foil loosely over the top for the rest of the bake.",
      },
      {
        cause: "you swap baking powder for soda",
        result: "Paler cookies with less toasty flavour, because the dough is more acidic.",
        fix: "Keep the leavener the recipe asks for.",
      },
      {
        cause: "the bottoms burn but the tops are pale",
        result: "Dark, bitter bases.",
        fix: "Move the rack up, or use a light-coloured pan. Dark pans absorb more heat.",
      },
    ],
    diagramLabel:
      "A thermometer from 100 to 200 °C. At 100 °C water boils and wet surfaces can’t brown. Around 140 °C the Maillard reaction speeds up. Around 160 °C table sugar caramelises. Near 200 °C things start to burn.",
  },

  oven: {
    lead: "Every bake is a race: the batter rises and spreads until the heat sets it. Oven temperature decides who wins.",
    sections: [
      {
        heading: "Hot sets fast, cool sets slow",
        paragraphs: [
          "A hot oven sets the outside quickly and browns it, and gives bread a strong oven spring. A cooler oven gives the batter more time to rise and spread before it sets.",
          "That is why breads bake hot, cakes and cookies bake at a moderate temperature, and anything delicate, like cheesecake, bakes low.",
        ],
      },
      {
        heading: "Your dial is probably wrong",
        paragraphs: [
          "Home ovens are often off by 10 to 25 °C, and they swing up and down as the element turns on and off. A cheap oven thermometer on the middle rack tells you what is really going on.",
          "Fan (convection) ovens move hot air over the food, which cooks faster. Lower the temperature by about 15 to 20 °C, or start checking early. Give any oven a full 20 minutes to preheat: the light often goes off before the walls are hot.",
        ],
      },
      {
        heading: "Checking doneness",
        paragraphs: [
          "Colour can fool you, a thermometer won’t. Bread is done by its internal temperature. Cakes are done when a skewer comes out clean and the top springs back.",
        ],
      },
    ],
    numbers: [
      // [REVIEW] typical ranges
      { label: "Bread", value: "≈ 190–230 °C" },
      { label: "Cakes and cookies", value: "≈ 175–180 °C" },
      { label: "Fan oven", value: "≈ 15–20 °C lower" },
      // [REVIEW] common guidance: enriched ~88 °C, lean ~93–99 °C
      { label: "Bread done inside", value: "enriched ≈ 88 °C, lean ≈ 95 °C" },
    ],
    failures: [
      {
        cause: "the oven runs hot",
        result: "A cake domes and cracks: the outside sets while the middle is still rising.",
        fix: "Check with an oven thermometer and lower the dial to match.",
      },
      {
        cause: "the oven runs cool, or the door opens early",
        result: "A cake sinks in the middle. Cookies spread flat and stay pale.",
        fix: "Preheat fully and keep the door shut for the first two thirds of the bake.",
      },
      {
        cause: "the pan sits too close to the element",
        result: "A burnt bottom or top while the inside is underbaked.",
        fix: "Bake on the middle rack unless the recipe says otherwise.",
      },
      {
        cause: "you use a fan oven at the recipe’s temperature",
        result: "Dark edges and a dry outside before the centre is done.",
        fix: "Lower it by about 15 to 20 °C.",
      },
    ],
    diagramLabel:
      "Cross-section of an oven with the heat rising from the element, a pan on the middle rack, and an oven thermometer reading lower than the dial.",
  },
};
