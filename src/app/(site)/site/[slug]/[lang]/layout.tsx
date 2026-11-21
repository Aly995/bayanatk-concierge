import type { Viewport } from "next";
// Fonts are bundled with the app (self-hosted): no request to Google at build or run time.
import "@fontsource/ibm-plex-sans-arabic/400.css";
import "@fontsource/ibm-plex-sans-arabic/500.css";
import "@fontsource/ibm-plex-sans-arabic/600.css";
import "@fontsource/ibm-plex-sans-arabic/700.css";
import "../../../../globals.css";
import { brandStyle } from "@/lib/site/brand-style";
import { findSite, isSiteLanguage } from "@/lib/site/load";
import { isRtl } from "@/lib/site/strings";

type Params = Promise<{ slug: string; lang: string }>;

/**
 * Root layout for hotel websites. It is separate from the app's main layout so that
 * <html> carries the page's real language and direction (lang="ar" dir="rtl" for Arabic).
 */
export default async function SiteLayout({ children, params }: { children: React.ReactNode; params: Params }) {
  const { slug, lang: rawLang } = await params;
  const lang = isSiteLanguage(rawLang) ? rawLang : "en";
  // Missing hotels are handled by the page (notFound); the layout just falls back to default colours.
  const found = await findSite(slug);
  return (
    <html lang={lang} dir={isRtl(lang) ? "rtl" : "ltr"}>
      <body className="site bg-hotel-surface font-sans text-[17px] text-hotel-ink antialiased" style={brandStyle(found?.site.brand)}>
        {children}
      </body>
    </html>
  );
}

export async function generateViewport({ params }: { params: Params }): Promise<Viewport> {
  const found = await findSite((await params).slug);
  return { themeColor: found?.site.brand.primary ?? "#0b5d45", width: "device-width", initialScale: 1 };
}
