import { Geist, Geist_Mono, Mynerve } from "next/font/google";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { DEFAULT_THEME, THEME_STORAGE_KEY } from "@/lib/themeSettings";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Handwriting, for margin notes only. It comes in a single weight.
const mynerve = Mynerve({
  variable: "--font-mynerve",
  weight: "400",
  subsets: ["latin"],
});

// Next.js turns this into the <title> and <meta> tags in the page's <head>.
export const metadata = {
  title: {
    default: "Baking Debugged",
    // Pages that set their own title get this pattern; %s is the page's title.
    template: "%s | Baking Debugged",
  },
  description:
    "Baking recipes measured in grams, with the science behind why bakes work or fail.",
};

// A tiny script that runs in the browser before the page is drawn. It reads
// the saved theme and sets data-theme on <html>, so a visitor who chose dark
// never sees a flash of the light theme first. It is written as text because
// it has to run before React loads. try/catch covers browsers where
// localStorage is blocked.
const themeScript = `try {
  var theme = localStorage.getItem("${THEME_STORAGE_KEY}");
  if (theme) document.documentElement.dataset.theme = theme;
} catch (error) {}`;

export default function RootLayout({ children }) {
  return (
    // data-theme starts as the default; the script below may change it in the
    // browser. suppressHydrationWarning tells React that difference is expected.
    <html
      lang="en"
      data-theme={DEFAULT_THEME}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${mynerve.variable} h-full antialiased`}
    >
      <head>
        {/* dangerouslySetInnerHTML puts raw text inside the tag. The name is
            a warning: only ever use it with text we wrote ourselves. */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        {/* children is whichever page is being shown */}
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
