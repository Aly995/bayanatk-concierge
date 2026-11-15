import type { CSSProperties } from "react";
import type { Viewport } from "next";
// Fonts are bundled with the app (self-hosted): no request to Google at build or run time.
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/readex-pro";
import "../../../../globals.css";
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
  const brand = found?.site.brand;
  const vars = brand
    ? ({ "--hotel-primary": brand.primary, "--hotel-accent": brand.accent, "--hotel-ink": brand.ink } as CSSProperties)
    : undefined;
  return (
    <html lang={lang} dir={isRtl(lang) ? "rtl" : "ltr"}>
      <body className="site bg-white font-sans text-[17px] text-hotel-ink antialiased" style={vars}>
        {children}
      </body>
    </html>
  );
}

export async function generateViewport({ params }: { params: Params }): Promise<Viewport> {
  const found = await findSite((await params).slug);
  return { themeColor: found?.site.brand.primary ?? "#0b6e4f", width: "device-width", initialScale: 1 };
}
