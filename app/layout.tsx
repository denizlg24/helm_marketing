import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";

export const revalidate = 3600;

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-calistoga",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Helm — Your personal operating system",
  description:
    "Helm is a customer-customizable life dashboard. Notes, tasks, schedule, people, inbox, and infrastructure — under one private console you shape around your day.",
  metadataBase: new URL("https://helm.example"),
  openGraph: {
    title: "Helm — Your personal operating system",
    description:
      "A modular life dashboard with an AI operator. Private by default. Desktop-first.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${display.variable}`}>
      <body className="min-h-screen bg-background font-[var(--font-inter)] text-foreground antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
