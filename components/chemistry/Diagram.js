// The pen-sketch diagram for each chemistry explainer, drawn in SVG.
//
// Everything is drawn in currentColor (the text colour), so the sketches
// follow the theme. Labels use the handwriting font. Each diagram is one
// picture to a screen reader: role="img" plus a written description
// (aria-label), and the shapes inside are not read out one by one.
//
// SVG reminders: in a path, M = move the pen, L = line to, C / S = curves,
// Q / T = simpler curves, and lowercase letters mean "relative to where the
// pen is now". x grows to the right, y grows DOWNWARDS.

// Shared pen settings for the lines in every sketch.
const PEN = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.4,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

// Labels: the handwriting font at a fixed size inside the drawing.
function Note({ x, y, children, anchor = "start" }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      className="hand"
      style={{ fontSize: "18px" }}
      fill="currentColor"
    >
      {children}
    </text>
  );
}

// Numbers and temperatures: monospace, like everywhere else on the site.
function Figure({ x, y, children, anchor = "start" }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fill="currentColor"
      style={{ fontFamily: "var(--font-mono)", fontSize: "13px" }}
    >
      {children}
    </text>
  );
}

// Soda vs powder: when each one gives off its gas.
function Leaveners() {
  return (
    <svg viewBox="0 0 360 236">
      {/* dashed lines dividing mixing, resting and the oven */}
      <g stroke="currentColor" strokeWidth="1" strokeDasharray="3 4" opacity="0.6">
        <line x1="138" y1="34" x2="138" y2="180" />
        <line x1="232" y1="34" x2="232" y2="180" />
      </g>
      {/* soda: one burst when mixed, then it fades */}
      <path
        {...PEN}
        strokeWidth="3"
        d="M34 180 C 46 176, 52 40, 68 38 C 86 36, 96 122, 138 146 C 180 164, 210 168, 232 168 C 262 166, 300 176, 344 178"
      />
      {/* powder: a small burst, then a big one in the oven (dotted line) */}
      <path
        {...PEN}
        strokeWidth="3"
        strokeDasharray="2 7"
        d="M34 180 C 50 176, 58 132, 74 132 C 92 132, 104 166, 138 170 C 176 172, 214 172, 232 170 C 250 164, 262 44, 280 42 C 298 40, 310 150, 344 172"
      />
      {/* the axes */}
      <path {...PEN} strokeWidth="2" d="M34 14 V180 H346" />
      <Note x={42} y={26}>soda + acid</Note>
      <Note x={256} y={26}>powder</Note>
      <Note x={86} y={202} anchor="middle">mix</Note>
      <Note x={185} y={202} anchor="middle">rest</Note>
      <Note x={289} y={202} anchor="middle">oven</Note>
      <Note x={34} y={228}>gas given off, over time</Note>
    </svg>
  );
}

// Gluten: tangled bits become long strands that hold bubbles.
function Gluten() {
  // Short squiggles scattered in the left box: [x, y] of each start point
  const bits = [
    [28, 45], [76, 40], [112, 55], [36, 85], [88, 80],
    [118, 102], [30, 125], [70, 120], [104, 142], [56, 150],
  ];
  return (
    <svg viewBox="0 0 360 200">
      <rect {...PEN} strokeWidth="1.5" x="12" y="22" width="138" height="146" rx="4" />
      <rect {...PEN} strokeWidth="1.5" x="210" y="22" width="138" height="146" rx="4" />
      {bits.map(([x, y]) => (
        <path key={`${x}-${y}`} {...PEN} d={`M${x} ${y} q6 -8 12 0 t12 0`} />
      ))}
      {/* long aligned strands */}
      {[48, 80, 112, 144].map((y) => (
        <path
          key={y}
          {...PEN}
          d={`M220 ${y} C 240 ${y - 10}, 260 ${y + 10}, 280 ${y} S 320 ${y - 10}, 338 ${y}`}
        />
      ))}
      {/* gas bubbles caught between the strands */}
      <g fill="var(--surface)" stroke="currentColor" strokeWidth="2">
        <circle cx="250" cy="64" r="7" />
        <circle cx="310" cy="96" r="8" />
        <circle cx="268" cy="128" r="6" />
        <circle cx="326" cy="64" r="5" />
      </g>
      {/* arrow between the boxes */}
      <path {...PEN} d="M158 95 H202" />
      <path {...PEN} d="M194 88 L203 95 L194 102" />
      <Note x={180} y={82} anchor="middle">knead</Note>
      <Note x={81} y={190} anchor="middle">just mixed</Note>
      <Note x={279} y={190} anchor="middle">kneaded</Note>
    </svg>
  );
}

// Hydration: the same dough ball at three hydrations.
function Hydration() {
  return (
    <svg viewBox="0 0 360 200">
      <path {...PEN} strokeWidth="1.5" d="M8 150 H352" />
      <path {...PEN} d="M24 150 C 24 92, 96 92, 96 150" />
      <path {...PEN} d="M128 150 C 134 112, 226 112, 232 150" />
      <path {...PEN} d="M240 150 C 250 134, 342 134, 352 150" />
      <Note x={60} y={84} anchor="middle">stands tall</Note>
      <Note x={180} y={104} anchor="middle">slumps</Note>
      <Note x={296} y={126} anchor="middle">spreads</Note>
      <Figure x={60} y={176} anchor="middle">58 %</Figure>
      <Figure x={180} y={176} anchor="middle">70 %</Figure>
      <Figure x={296} y={176} anchor="middle">85 %</Figure>
    </svg>
  );
}

// Sugar: creaming cuts air pockets into butter.
function Sugar() {
  // Each sugar crystal, with an air pocket just beside it
  const crystals = [
    [110, 125], [170, 150], [225, 120], [140, 175], [245, 170], [88, 160],
  ];
  return (
    <svg viewBox="0 0 340 230">
      {/* the butter */}
      <path
        {...PEN}
        d="M40 150 C 30 90, 110 70, 170 80 C 240 70, 310 100, 300 155 C 295 200, 220 210, 160 202 C 90 210, 45 195, 40 150 Z"
      />
      {crystals.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          {/* a small square turned on its corner */}
          <rect
            x={x - 5}
            y={y - 5}
            width="10"
            height="10"
            fill="currentColor"
            transform={`rotate(20 ${x} ${y})`}
          />
          <circle cx={x + 14} cy={y + 3} r="5" fill="var(--surface)" stroke="currentColor" strokeWidth="1.8" />
        </g>
      ))}
      <Note x={14} y={26}>sugar crystal</Note>
      <path {...PEN} d="M62 34 C 74 62, 90 92, 104 116" />
      <path {...PEN} d="M93 110 L105 118 L106 104" />
      <Note x={226} y={26}>air pocket</Note>
      <path {...PEN} d="M262 34 C 258 62, 250 92, 242 114" />
      <path {...PEN} d="M236 104 L241 116 L251 107" />
    </svg>
  );
}

// Fats: butter pieces in pastry turn to steam and lift the layers.
function Fats() {
  const before = [48, 80, 112, 144];
  const after = [36, 76, 116, 156];
  return (
    <svg viewBox="0 0 360 210">
      {before.map((y) => (
        <rect key={y} {...PEN} strokeWidth="2" x="14" y={y} width="148" height="18" rx="3" />
      ))}
      {/* flat pieces of butter between the layers */}
      <g fill="var(--tape)" stroke="currentColor" strokeWidth="1.2">
        {[68, 100, 132].map((y) => (
          <g key={y}>
            <rect x="28" y={y} width="32" height="9" rx="3" />
            <rect x="76" y={y} width="26" height="9" rx="3" />
            <rect x="118" y={y} width="30" height="9" rx="3" />
          </g>
        ))}
      </g>
      {after.map((y) => (
        <rect key={y} {...PEN} strokeWidth="2" x="198" y={y} width="148" height="18" rx="3" />
      ))}
      {/* steam curls in the gaps */}
      {[58, 98, 138].map((y) => (
        <g key={y}>
          <path {...PEN} strokeWidth="1.8" d={`M216 ${y + 10} q5 -7 10 0 t10 0`} />
          <path {...PEN} strokeWidth="1.8" d={`M262 ${y + 10} q5 -7 10 0 t10 0`} />
          <path {...PEN} strokeWidth="1.8" d={`M308 ${y + 10} q5 -7 10 0 t10 0`} />
        </g>
      ))}
      <path {...PEN} d="M168 100 H190" />
      <path {...PEN} d="M182 93 L191 100 L182 107" />
      <Note x={88} y={196} anchor="middle">butter in layers</Note>
      <Note x={272} y={196} anchor="middle">steam lifts them</Note>
    </svg>
  );
}

// Eggs: coiled proteins unfold and link up in the heat.
function Eggs() {
  // A coil: loops drawn one after another with relative curves
  const coil =
    "c 0 -14 18 -14 18 0 c 0 14 -12 14 -12 0 c 0 -14 18 -14 18 0 c 0 14 -12 14 -12 0 c 0 -14 18 -14 18 0 c 0 14 -12 14 -12 0 c 0 -14 18 -14 18 0";
  // The net: points, then which points are joined
  const nodes = [
    [212, 42], [266, 56], [326, 44], [222, 100], [282, 94],
    [336, 108], [208, 152], [266, 156], [324, 160],
  ];
  const links = [
    [0, 1], [1, 2], [0, 3], [1, 4], [2, 5], [3, 4], [4, 5],
    [3, 6], [4, 7], [5, 8], [6, 7], [7, 8], [1, 3], [4, 8],
  ];
  return (
    <svg viewBox="0 0 360 206">
      {[56, 100, 144].map((y) => (
        <path key={y} {...PEN} strokeWidth="2.2" d={`M34 ${y} ${coil}`} />
      ))}
      {links.map(([a, b]) => (
        <line
          key={`${a}-${b}`}
          x1={nodes[a][0]}
          y1={nodes[a][1]}
          x2={nodes[b][0]}
          y2={nodes[b][1]}
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      ))}
      {nodes.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="3.5" fill="currentColor" />
      ))}
      <path {...PEN} d="M150 100 H186" />
      <path {...PEN} d="M178 93 L187 100 L178 107" />
      <Note x={168} y={84} anchor="middle">heat</Note>
      <Note x={78} y={194} anchor="middle">folded up</Note>
      <Note x={272} y={194} anchor="middle">linked into a net</Note>
    </svg>
  );
}

// Browning: a thermometer with the temperatures that matter.
function Browning() {
  // Where a temperature sits on the scale: 100 °C at y=200, 200 °C at y=30
  const y = (celsius) => 200 - (celsius - 100) * 1.7;
  const marks = [
    { t: 100, note: "water boils: wet = pale" },
    { t: 140, note: "Maillard speeds up" },
    { t: 160, note: "sugar caramelises" },
    { t: 200, note: "heading for burnt" },
  ];
  return (
    <svg viewBox="0 0 380 256">
      {/* the tube and bulb */}
      <path {...PEN} d="M60 222 V22 a10 10 0 0 1 20 0 V222" />
      <circle {...PEN} cx="70" cy="234" r="16" />
      {/* the liquid, up to 160 °C */}
      <circle cx="70" cy="234" r="10" fill="currentColor" />
      <rect x="65" y={y(160)} width="10" height={234 - y(160)} fill="currentColor" />
      {marks.map((mark) => (
        <g key={mark.t}>
          <line x1="82" y1={y(mark.t)} x2="98" y2={y(mark.t)} stroke="currentColor" strokeWidth="2" />
          <Figure x={104} y={y(mark.t) + 4}>{`${mark.t} °C`}</Figure>
          <Note x={164} y={y(mark.t) + 5}>{mark.note}</Note>
        </g>
      ))}
    </svg>
  );
}

// Oven: heat rising, a pan on the middle rack, and a dial that lies.
function Oven() {
  // The zigzag heating element along the bottom, built as a string
  let element = "M30 226";
  for (let i = 0; i < 16; i += 1) {
    element += i % 2 === 0 ? " l12 -8" : " l12 8";
  }
  return (
    <svg viewBox="0 0 360 256">
      <Note x={10} y={30}>dial says 180 °C</Note>
      {/* the knob */}
      <circle {...PEN} strokeWidth="2" cx="214" cy="26" r="11" />
      <path {...PEN} strokeWidth="2" d="M214 26 L221 18" />
      {/* the oven box and two racks */}
      <rect {...PEN} x="10" y="50" width="230" height="194" rx="8" />
      <path {...PEN} strokeWidth="1.6" d="M20 120 H230 M20 170 H230" />
      {/* a cake pan on the lower rack */}
      <rect {...PEN} strokeWidth="2" x="80" y="152" width="90" height="18" rx="2" />
      {/* the element and heat rising from it */}
      <path {...PEN} strokeWidth="2" d={element} />
      <path {...PEN} strokeWidth="1.8" d="M48 210 c -8 -10 8 -20 0 -30 c -8 -10 8 -20 0 -30" />
      <path {...PEN} strokeWidth="1.8" d="M204 210 c -8 -10 8 -20 0 -30 c -8 -10 8 -20 0 -30" />
      {/* an oven thermometer hanging from the top rack */}
      <path {...PEN} strokeWidth="1.6" d="M196 120 V125" />
      <circle cx="196" cy="139" r="13" fill="var(--surface)" stroke="currentColor" strokeWidth="2" />
      <path {...PEN} strokeWidth="2" d="M196 139 L188 132" />
      {/* the note on the right */}
      <Note x={252} y={134}>really</Note>
      <Note x={252} y={156}>165 °C</Note>
      <path {...PEN} d="M250 145 C 238 145, 228 142, 214 140" />
      <path {...PEN} d="M222 134 L213 140 L222 147" />
    </svg>
  );
}

const DIAGRAMS = {
  leaveners: Leaveners,
  gluten: Gluten,
  hydration: Hydration,
  sugar: Sugar,
  fats: Fats,
  eggs: Eggs,
  browning: Browning,
  oven: Oven,
};

// Draws the diagram for one explainer. "label" is the description read out
// to screen readers.
export default function Diagram({ slug, label }) {
  // A component chosen at run time must be stored in a capitalised name
  // before React can draw it as <Sketch />.
  const Sketch = DIAGRAMS[slug];
  if (!Sketch) {
    return null;
  }
  return (
    <div role="img" aria-label={label} className="[&>svg]:block [&>svg]:h-auto [&>svg]:w-full">
      <Sketch />
    </div>
  );
}
