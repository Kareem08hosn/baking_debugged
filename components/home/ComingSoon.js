// The three AI tools planned for later (Phases 5 and 6). Nothing here is a
// link: they don't exist yet, and the page says so.
const PLANNED_TOOLS = [
  {
    name: "Why did my bake fail?",
    summary: "Describe what happened and get the likely causes.",
  },
  {
    name: "Substitutions, with the chemistry",
    summary: "What changes when you swap an ingredient, and why.",
  },
  {
    name: "Find a recipe by describing it",
    summary: "“Something chewy with brown butter.”",
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
        Three AI tools are being built. None of them are live yet.
      </p>
      <ul className="mt-4 grid gap-4">
        {PLANNED_TOOLS.map((tool) => (
          <li key={tool.name} className="sketch-card">
            <b className="block font-mono">{tool.name}</b>
            <span className="text-muted">{tool.summary}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
