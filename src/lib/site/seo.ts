import type { Hotel } from "../types";
import { pick, SITE_LANGUAGES, type HotelSite, type SiteLanguage } from "./schema";

export const sitePath = (slug: string, lang: SiteLanguage, page = "") => `/site/${slug}/${lang}${page ? `/${page}` : ""}`;

/** Canonical and hreflang links, so search engines show each guest the right language. */
export function languageAlternates(slug: string, lang: SiteLanguage, page = "") {
  const languages: Record<string, string> = Object.fromEntries(SITE_LANGUAGES.map((l) => [l, sitePath(slug, l, page)]));
  languages["x-default"] = sitePath(slug, "en", page);
  return { canonical: sitePath(slug, lang, page), languages };
}

/** schema.org Hotel data (JSON-LD) for search engines and AI assistants. Only facts from the site content. */
export function hotelJsonLd(hotel: Hotel, site: HotelSite, lang: SiteLanguage, baseUrl: string) {
  const prices = site.rooms.map((r) => r.fromPrice);
  return {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: lang === "ar" ? hotel.nameAr : hotel.name,
    description: pick(site.intro, lang),
    url: `${baseUrl}${sitePath(hotel.slug, lang)}`,
    inLanguage: lang,
    availableLanguage: SITE_LANGUAGES,
    telephone: site.contact.phone,
    email: site.contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: pick(site.location.address, lang),
      addressLocality: lang === "ar" ? "المدينة المنورة" : "Madinah",
      addressCountry: "SA",
    },
    geo: { "@type": "GeoCoordinates", latitude: site.location.lat, longitude: site.location.lng },
    checkinTime: site.policies.checkIn,
    checkoutTime: site.policies.checkOut,
    priceRange: `SAR ${Math.min(...prices)}–${Math.max(...prices)}`,
    currenciesAccepted: "SAR",
    amenityFeature: site.amenities.map((a) => ({
      "@type": "LocationFeatureSpecification",
      name: pick(a.label, lang),
      value: true,
    })),
  };
}

/** JSON for a <script> tag. Escapes "<" so content can never close the tag. */
export const jsonForScript = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");
