import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Rajdhani } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { meta, contact } from "@/data/portfolio";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { CommandPaletteProvider } from "@/hooks/useCommandPalette";
import CommandPalette from "@/components/CommandPalette";

// ── Fonts ─────────────────────────────────────────────────────
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-rajdhani",
  display: "swap",
});

// ── Metadata ──────────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default: "Mthokozisi Dhlamini | Cloud & Software Engineer",
    template: "%s | Mthokozisi Dhlamini",
  },
  description: meta.description,
  keywords: [
    "Mthokozisi Dhlamini",
    "Cloud Engineer",
    "Software Engineer",
    "Johannesburg",
    "South Africa",
    "UniApplyForMe",
    "DesignThat Cloud",
    "Flutter",
    "Next.js",
  ],
  authors: [{ name: "Mthokozisi Dhlamini", url: meta.siteUrl }],
  openGraph: {
    title: "Mthokozisi Dhlamini | Cloud & Software Engineer",
    description: meta.description,
    url: meta.siteUrl,
    siteName: "Mthokozisi Dhlamini",
    images: [
      {
        url: meta.ogImage,
        width: 1200,
        height: 630,
        alt: "Mthokozisi Dhlamini | Cloud & Software Engineer",
      },
    ],
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mthokozisi Dhlamini | Cloud & Software Engineer",
    description: meta.description,
    creator: "@Sthabiso_iv",
    images: [meta.ogImage],
  },
  robots: { index: true, follow: true },
  metadataBase: new URL(meta.siteUrl),
  alternates: { canonical: meta.siteUrl },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

// ── JSON-LD Person schema ─────────────────────────────────────
const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Mthokozisi Dhlamini",
  alternateName: "Mtho",
  url: meta.siteUrl,
  jobTitle: "Cloud & Software Engineer",
  description: meta.description,
  address: { "@type": "PostalAddress", addressLocality: "Johannesburg", addressCountry: "ZA" },
  sameAs: contact.links.map((l) => l.href),
};

// ── Root Layout ───────────────────────────────────────────────
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${rajdhani.variable}`}>
      <head>
        <Script
          data-host="https://alx.designthat.cloud"
          data-dnt="false"
          src="https://alx.designthat.cloud/js/script.js"
          id="ZwSg9rf6GA"
          strategy="afterInteractive"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </head>
      {/*
        suppressHydrationWarning prevents false-positive hydration errors
        caused by browser extensions (e.g. Grammarly) that inject attributes
        onto <body> before React hydrates.
      */}
      <body
        className="bg-dark text-text-primary font-body antialiased"
        suppressHydrationWarning
      >
        <CommandPaletteProvider>
          <Nav />
          {children}
          <Footer />
          <CommandPalette />
        </CommandPaletteProvider>
        <Analytics />
      </body>
    </html>
  );
}
