import Link from "next/link";
import type { HotelSite, SiteLanguage } from "@/lib/site/schema";
import { sitePath } from "@/lib/site/seo";
import type { SiteStrings } from "@/lib/site/strings";
import { telHref } from "@/lib/site/links";
import type { Hotel } from "@/lib/types";

/** What every part of a hotel website receives. */
export type SiteProps = { hotel: Hotel; site: HotelSite; lang: SiteLanguage; s: SiteStrings };

export const hotelName = (hotel: Hotel, lang: SiteLanguage) => (lang === "ar" ? hotel.nameAr : hotel.name);

export function DemoBanner({ site, s }: SiteProps) {
  if (!site.isDemo) return null;
  return <p className="bg-hotel-accent/25 px-4 py-2 text-center text-sm text-hotel-ink">{s.demoBanner}</p>;
}

export function SiteHeader({ hotel, lang, s }: SiteProps) {
  const other: SiteLanguage = lang === "ar" ? "en" : "ar";
  return (
    <header className="sticky top-0 z-30 border-b border-hotel-ink/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link href={sitePath(hotel.slug, lang)} className="min-w-0 truncate text-lg font-bold text-hotel">
          {hotelName(hotel, lang)}
        </Link>
        <nav aria-label={lang === "ar" ? "أقسام الصفحة" : "Page sections"} className="ms-auto hidden gap-6 text-[15px] md:flex">
          <a href="#rooms" className="hover:text-hotel">{s.nav.rooms}</a>
          <a href="#offers" className="hover:text-hotel">{s.nav.offers}</a>
          <a href="#location" className="hover:text-hotel">{s.nav.location}</a>
          <a href="#faq" className="hover:text-hotel">{s.nav.faq}</a>
        </nav>
        <a
          href={sitePath(hotel.slug, other)}
          hrefLang={other}
          lang={other}
          className="ms-auto shrink-0 text-[15px] underline-offset-4 hover:underline md:ms-0"
        >
          {s.otherLangName}
        </a>
        <Link
          href={sitePath(hotel.slug, lang, "book")}
          className="hidden shrink-0 rounded-lg bg-hotel px-4 py-2 text-[15px] font-semibold text-white hover:bg-hotel/90 sm:inline-block"
        >
          {s.book}
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter({ hotel, site, lang, s }: SiteProps) {
  return (
    <footer className="bg-hotel-ink text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-[1.4fr_1fr_1fr] sm:px-6">
        <div>
          <p className="text-lg font-bold">{hotelName(hotel, lang)}</p>
          <p className="mt-2 max-w-sm text-white/70">{site.location.address[lang]}</p>
          {site.licence && (
            <p className="mt-4 text-sm text-white/70">
              {s.licence}: <span dir="ltr">{site.licence}</span>
            </p>
          )}
        </div>
        <div>
          <h2 className="font-semibold">{s.contactTitle}</h2>
          <dl className="mt-3 space-y-2 text-white/80">
            <div>
              <dt className="sr-only">{s.phone}</dt>
              <dd><a href={telHref(site.contact.phone)} dir="ltr" className="hover:text-white">{site.contact.phone}</a></dd>
            </div>
            <div>
              <dt className="sr-only">{s.email}</dt>
              <dd><a href={`mailto:${site.contact.email}`} className="break-all hover:text-white">{site.contact.email}</a></dd>
            </div>
          </dl>
        </div>
        <div className="space-y-2 text-white/80">
          <p><Link href={`/h/${hotel.slug}/privacy`} className="hover:text-white">{s.privacy}</Link></p>
          <p><a href="https://bayanatk.com" className="hover:text-white">{s.madeBy}</a></p>
        </div>
      </div>
    </footer>
  );
}
