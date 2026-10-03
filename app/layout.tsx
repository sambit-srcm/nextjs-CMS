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

/** Used when Contentful does not return a site name or description. */
const FALLBACK = {
  siteName: "Circuit",
  siteTagline: "Phones & Tech",
  footerTagline: "Independent phone reviews and launch coverage.",
  metaDescription: "Phone reviews and launch coverage across Android and iOS.",
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return {
    // Base for relative canonical and Open Graph URLs.
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
      data-theme="light"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Apply a saved theme before the page paints, so it does not flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {/* Hidden until focused. Lets keyboard users skip the navigation. */}
        <a
          href="#main"
          className="sr-only bg-accent px-4 py-2 text-sm text-accent-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <SiteHeader
          siteName={settings?.siteName || FALLBACK.siteName}
          siteTagline={settings?.siteTagline || FALLBACK.siteTagline}
          logo={settings?.logo}
        />
        {/* Page content. The header and footer stay outside this landmark. */}
        <main id="main" className="flex flex-1 flex-col">
          {children}
        </main>
        <SiteFooter
          siteName={settings?.siteName || FALLBACK.siteName}
          footerTagline={settings?.footerTagline || FALLBACK.footerTagline}
        />
      </body>
    </html>
  );
}
