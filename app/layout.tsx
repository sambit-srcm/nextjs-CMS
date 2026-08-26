import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSiteSettings } from "@/lib/cms/queries";
import { siteUrl } from "@/lib/site-url";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Brand strings used when the CMS is unreachable. The document must still have
 * a title and the chrome must still render; falling back to empty strings
 * would ship a nameless page.
 */
const FALLBACK = {
  siteName: "Circuit",
  siteTagline: "Phones & Tech",
  footerTagline: "Independent phone reviews and launch coverage.",
  metaDescription: "Phone reviews and launch coverage across Android and iOS.",
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return {
    // Resolves every relative `alternates.canonical` below it, and the
    // relative image URLs in each route's Open Graph card.
    metadataBase: new URL(siteUrl),
    title: settings?.siteName || FALLBACK.siteName,
    description: settings?.metaDescription || FALLBACK.metaDescription,
    alternates: { canonical: "/" },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const settings = await getSiteSettings();
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/*
          Applies a stored theme before the browser paints. Deferring this to
          an effect would render the default palette first and then flip,
          which is visible. Kept to one statement and wrapped in try/catch
          because localStorage throws when site data is blocked.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <SiteHeader
          siteName={settings?.siteName || FALLBACK.siteName}
          siteTagline={settings?.siteTagline || FALLBACK.siteTagline}
        />
        {children}
        <SiteFooter
          siteName={settings?.siteName || FALLBACK.siteName}
          footerTagline={settings?.footerTagline || FALLBACK.footerTagline}
        />
      </body>
    </html>
  );
}
