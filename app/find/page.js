import RecipeFinder from "@/components/ai/RecipeFinder";

export const metadata = {
  title: "Find a recipe",
  description: "Describe what you feel like baking, in your own words, and get matching recipes.",
};

export default function FindPage() {
  return (
    <main className="page pt-6">
      <h1 className="font-mono text-[clamp(2.4rem,10vw,4.5rem)] font-extrabold leading-none tracking-[-0.05em]">
        <span className="highlight">Find a recipe</span>
      </h1>
      <p className="mt-4 max-w-xl text-lg">
        Describe what you feel like baking, in your own words. Each match
        says why it fits.
      </p>
      <div className="mt-10">
        <RecipeFinder />
      </div>
    </main>
  );
}
