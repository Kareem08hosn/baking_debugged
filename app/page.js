// "@/" is a shortcut for the project root folder (set up in jsconfig.json)
import ChannelLinks from "@/components/home/ChannelLinks";
import ChemistryTeaser from "@/components/home/ChemistryTeaser";
import ComingSoon from "@/components/home/ComingSoon";
import FeaturedRecipes from "@/components/home/FeaturedRecipes";
import HomeHero from "@/components/home/HomeHero";
import ScalerDemo from "@/components/home/ScalerDemo";
import { pickDemoRecipe, pickFeatured } from "@/lib/featured";
import { getRecipes } from "@/lib/recipes";

// Next.js keeps a finished copy of this page and serves that to visitors, so
// most visits don't touch the database at all. This number is how many
// seconds a copy may be reused before it is rebuilt with fresh data, so a
// change in the database shows up within a minute.
export const revalidate = 60;

// The homepage. Each section is its own component in components/home/;
// this file fetches the data once and hands each section what it needs.
// "async" lets the page wait for the database before it is drawn.
export default async function Home() {
  const recipes = await getRecipes();
  // { lead, others } pulls those two values out of the object returned
  const { lead, others } = pickFeatured(recipes);
  const demoRecipe = pickDemoRecipe(recipes);

  return (
    <main>
      <HomeHero recipe={lead} />
      <FeaturedRecipes recipes={others} total={recipes.length} />
      <ChemistryTeaser />
      {/* && means "only draw this if the left side exists" */}
      {demoRecipe && <ScalerDemo recipe={demoRecipe} />}
      <section className="page grid gap-16 pb-6 md:grid-cols-2">
        <ChannelLinks />
        <ComingSoon />
      </section>
    </main>
  );
}
