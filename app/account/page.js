import Link from "next/link";
import SignInCard from "@/components/SignInCard";
import PreferencesForm from "@/components/account/PreferencesForm";
import SignOutButton from "@/components/account/SignOutButton";
import DeleteMyData from "@/components/account/DeleteMyData";
import { getUser } from "@/lib/supabase/server";

export const metadata = { title: "Account" };

// Where the signed-in person's own things live.
const PLACES = [
  { href: "/bakes", title: "Bake log", text: "Every bake you’ve logged, with export and import." },
  { href: "/recipes", title: "Your recipes and saved ones", text: "The “mine” and “saved” tabs on the recipe list." },
  { href: "/recipes/new", title: "Add a recipe", text: "Private to you, with scaling and conversion." },
];

export default async function AccountPage() {
  const user = await getUser();

  if (!user) {
    return (
      <main className="page max-w-3xl pt-6">
        <SignInCard title="Sign in to see your account" text="One email, no password." />
      </main>
    );
  }

  return (
    <main className="page max-w-4xl pt-6">
      <h1 className="page-title">
        <span className="highlight">Account</span>
      </h1>
      <p className="mt-4 break-words font-mono text-muted">Signed in as {user.email}</p>

      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <section aria-labelledby="places-heading">
          <h2 id="places-heading" className="panel-title">Your notebook</h2>
          <ul className="mt-4">
            {PLACES.map((place) => (
              <li key={place.href} className="border-b border-dashed border-line last:border-b-0">
                <Link href={place.href} className="group block py-3">
                  <span className="font-mono font-bold group-hover:underline">{place.title}</span>
                  <span className="block text-sm text-muted">{place.text}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="prefs-heading" className="note tape px-5 pb-6 pt-8">
          <h2 id="prefs-heading" className="panel-title">Preferences</h2>
          <div className="mt-4">
            <PreferencesForm />
          </div>
        </section>
      </div>

      <div className="mt-12 flex flex-wrap items-start gap-x-4 gap-y-4 border-t-[1.5px] border-dashed border-foreground pt-6">
        <SignOutButton />
        <DeleteMyData />
      </div>
      <p className="mt-6 text-sm text-muted">
        What’s stored and why: <Link href="/privacy" className="underline underline-offset-4">privacy</Link>.
      </p>
    </main>
  );
}
