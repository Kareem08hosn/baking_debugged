import Link from "next/link";

// The three AI tools (Phases 5 and 6). Each already works without AI;
// the AI part switches on once the Gemini key is set.
const PLANNED_TOOLS = [
  {
    name: "Why did my bake fail?",
    summary: "The rules-based debugger works now. Plain-language AI explanations come next.",
    href: "/debugger",
    linkText: "Try the debugger",
  },
  {
    name: "Substitutions, with the chemistry",
    summary: "The common swaps are in the notebook now. AI covers the rest soon.",
    href: "/substitutions",
    linkText: "Find a swap",
  },
  {
    name: "Find a recipe by describing it",
    summary: "Keyword matching works now. Smart search that understands “chewy” or “cosy” is next.",
    href: "/find",
    linkText: "Describe one",
  },
];

export default function ComingSoon() {
  return (
    <div className="relative">
      <p className="stamp-label absolute right-0 top-1.5 rotate-[7deg]">
        Not baked yet
      </p>
      {/* pr-28 keeps the heading clear of the stamp */}
      <h2 className="section-title pr-28">Still in the oven</h2>
      <p className="mt-3 max-w-md">
        Three tools with AI on the way. Each one already works without it.
      </p>
      <ul className="mt-4 grid gap-4">
        {PLANNED_TOOLS.map((tool) => (
          <li key={tool.name} className="sketch-card">
            <b className="block font-mono">{tool.name}</b>
            <span className="text-muted">{tool.summary}</span>
            {tool.href && (
              <Link href={tool.href} className="mt-1.5 block font-mono text-sm font-bold underline underline-offset-4">
                {tool.linkText}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
