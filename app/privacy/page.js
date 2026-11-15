import Link from "next/link";
import { isAiEnabled } from "@/lib/ai/config";

export const metadata = {
  title: "Privacy",
  description: "What Baking Debugged stores about you, where, and how to delete it.",
};

// The privacy page. It describes what the code actually does; anything the
// code can't know (contact details, hosting) is a [TODO: Kareem].
// [REVIEW] Not written by a lawyer. Update it whenever a feature changes
// what is stored (and before AI features launch).
const SECTIONS = [
  {
    heading: "The short version",
    paragraphs: [
      "You can read every recipe, chemistry note and tool without an account. Nothing about you is stored unless you sign in, apart from your theme choice in your own browser.",
      "There are no ads, no analytics and no trackers on this site.",
    ],
  },
  {
    heading: "If you sign in",
    paragraphs: [
      "Signing in needs only your email address. It’s used to send you sign-in links and nothing else.",
      "Everything you add is stored with your account: your own recipes, saved recipes, bake log, recipe notes and preferences. The database is set up so only you can read or change your entries. Your recipes aren’t shared with other visitors.",
      "Accounts and data are handled by Supabase, which provides the database and sign-in. [TODO: Kareem: add the Supabase project’s region, and the hosting provider once the site is deployed.]",
    ],
  },
  {
    heading: "Cookies and browser storage",
    paragraphs: [
      "When you’re signed in, a cookie keeps you signed in. While you’re signing in, a second cookie remembers which page to bring you back to; it expires after an hour.",
      "Your light, dark or system theme choice is saved in your browser (localStorage), not on our servers. Recipes added before accounts existed may also still be in your browser until you move them to your account.",
    ],
  },
  // The AI section is filled in below, depending on whether AI is on.
  { heading: "AI features", paragraphs: [] },
  {
    heading: "Deleting your data",
    paragraphs: [
      "On your Account page, “Delete my data” permanently removes everything you’ve stored: recipes, saved recipes, bakes, notes and preferences.",
      "To delete the account itself (your email address), contact [TODO: Kareem: contact email].",
    ],
  },
];

// What the AI section says, now or before launch.
function aiParagraphs() {
  if (isAiEnabled()) {
    return [
      "Three features use Google’s Gemini AI: “Ask the AI” on the substitutions page, “Explain it in plain words” in the bake debugger, and smart search on the find-a-recipe page. When you use one, the text of your question (and, for substitutions, the recipe’s ingredient list) is sent to Gemini. Nothing else about you is sent: not your email, bakes or notes.",
      "This site uses Gemini’s free tier, where Google may use what is sent to improve its products. Don’t type anything personal into these features.",
      "Answers are saved and reused for the same question, so they’re stored without any link to who asked. Each person can make a limited number of AI requests per day; the count is stored with your account.",
    ];
  }
  return [
    "Planned features (substitution suggestions, plain-language bake explanations and smart search) will send the text you type to Google’s Gemini service. On Gemini’s free tier, Google may use those inputs to improve its products. This page will say so here, and the features will say so next to their buttons, once they’re switched on.",
  ];
}

export default function PrivacyPage() {
  return (
    <main className="page max-w-3xl pt-6">
      <h1 className="page-title">
        <span className="highlight">Privacy</span>
      </h1>
      <p className="mt-3 font-mono text-sm text-muted">Last updated 14 November 2026</p>

      {SECTIONS.map((section) => (
        <section key={section.heading} className="mt-10 max-w-[65ch]">
          <h2 className="panel-title">{section.heading}</h2>
          {(section.heading === "AI features" ? aiParagraphs() : section.paragraphs).map((paragraph) => (
            <p key={paragraph} className="mt-3 text-[1.0625rem] leading-relaxed">
              {paragraph}
            </p>
          ))}
        </section>
      ))}

      <p className="mt-12">
        <Link href="/account" className="link">
          Go to your account
        </Link>
      </p>
    </main>
  );
}
