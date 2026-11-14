import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
