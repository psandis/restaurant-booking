import type { Metadata } from "next";
import { Playfair_Display, Roboto } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://psandis.github.io/restaurant-booking"),
  title: "Ember & Ash | Restaurant Booking",
  description:
    "An elegant, mobile-first booking ritual for Ember & Ash - choose your setting, preview availability, and confirm in under a minute.",
  openGraph: {
    title: "Ember & Ash | Restaurant Booking",
    description:
      "Wood-fired gastronomy meets anticipatory hospitality. Curate The Hearth, Chef’s Table, Courtyard, or Private Cellar with live availability.",
    url: "https://ember-and-ash.example",
    siteName: "Ember & Ash",
    images: [
      {
        url: "/og-card.png",
        width: 1200,
        height: 630,
        alt: "Ember & Ash booking interface preview",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${roboto.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
