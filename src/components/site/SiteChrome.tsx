import Link from "next/link";
import type { HotelSite, SiteLanguage } from "@/lib/site/schema";
import { sitePath } from "@/lib/site/seo";
import type { SiteStrings } from "@/lib/site/strings";
import { telHref } from "@/lib/site/links";
import type { Hotel } from "@/lib/types";

/** What every part of a hotel website receives. */
export type SiteProps = { hotel: Hotel; site: HotelSite; lang: SiteLanguage; s: SiteStrings };

export const hotelName = (hotel: Hotel, lang: SiteLanguage) => (lang === "ar" ? hotel.nameAr : hotel.name);

/** The page's one accent (10%) button style: gold with dark text, for the main action only. */
export const accentButton =
  "inline-flex items-center justify-center rounded-md bg-hotel-accent px-5 py-3 font-semibold text-hotel-ink hover:brightness-105 focus-visible:outline-white";

export function DemoBanner({ site, s }: SiteProps) {
  if (!site.isDemo) return null;
  return <p className="bg-hotel-ink px-4 py-2 text-center text-sm text-white/85">{s.demoBanner}</p>;
}

/** Header on the hotel's main colour (part of the 30%). Section links collapse into a menu on phones. */
export function SiteHeader({ hotel, lang, s }: SiteProps) {
  const other: SiteLanguage = lang === "ar" ? "en" : "ar";
  const home = sitePath(hotel.slug, lang);
  const links = [
    { href: `${home}#rooms`, label: s.nav.rooms },
    { href: `${home}#offers`, label: s.nav.offers },
    { href: `${home}#facilities`, label: s.nav.facilities },
    { href: `${home}#groups`, label: s.nav.groups },
    { href: `${home}#location`, label: s.nav.location },
    { href: `${home}#faq`, label: s.nav.faq },
  ];
  return (
    <header className="sticky top-0 z-30 bg-hotel text-white shadow-[0_1px_0_rgb(255_255_255/0.12)]">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link href={home} className="min-w-0 truncate text-lg font-bold">
          {hotelName(hotel, lang)}
        </Link>
        <nav aria-label={s.sectionsLabel} className="ms-auto hidden gap-5 text-[15px] lg:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-white/85 underline-offset-8 hover:text-white hover:underline">
              {l.label}
            </a>
          ))}
        </nav>
        <a href={sitePath(hotel.slug, other)} hrefLang={other} lang={other} className="ms-auto shrink-0 text-[15px] hover:underline lg:ms-0">
          {s.otherLangName}
        </a>
        <Link href={sitePath(hotel.slug, lang, "book")} className={`${accentButton} shrink-0 px-4 py-2 text-[15px] max-sm:hidden`}>
          {s.book}
        </Link>
        <details className="group relative lg:hidden">
          <summary className="cursor-pointer list-none rounded-md border border-white/30 px-3 py-1.5 text-[15px] [&::-webkit-details-marker]:hidden">
            {s.menu}
          </summary>
          <nav aria-label={s.sectionsLabel} className="absolute end-0 top-full mt-2 w-56 rounded-lg bg-white p-2 text-hotel-ink shadow-xl">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="block rounded-md px-3 py-2.5 hover:bg-hotel-surface">
                {l.label}
              </a>
            ))}
          </nav>
        </details>
      </div>
    </header>
  );
}

export function SiteFooter({ hotel, site, lang, s }: SiteProps) {
  return (
    <footer className="bg-hotel text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-[1.4fr_1fr_1fr] sm:px-6">
        <div>
          <p className="text-lg font-bold">{hotelName(hotel, lang)}</p>
          <p className="mt-2 max-w-sm text-white/75">{site.location.address[lang]}</p>
          {site.licence && (
            <p className="mt-4 text-sm text-white/75">
              {s.licence}: <span dir="ltr">{site.licence}</span>
            </p>
          )}
        </div>
        <div>
          <h2 className="font-semibold">{s.contactTitle}</h2>
          <span aria-hidden="true" className="mt-2 block h-0.5 w-8 bg-hotel-accent" />
          <dl className="mt-3 space-y-2 text-white/85">
            <div>
              <dt className="sr-only">{s.phone}</dt>
              <dd><a href={telHref(site.contact.phone)} dir="ltr" className="hover:text-white hover:underline">{site.contact.phone}</a></dd>
            </div>
            <div>
              <dt className="sr-only">{s.email}</dt>
              <dd><a href={`mailto:${site.contact.email}`} className="break-all hover:text-white hover:underline">{site.contact.email}</a></dd>
            </div>
          </dl>
        </div>
        <div className="space-y-2 text-white/85">
          <p><Link href={`/h/${hotel.slug}/privacy`} className="hover:text-white hover:underline">{s.privacy}</Link></p>
          <p><a href="https://bayanatk.com" className="hover:text-white hover:underline">{s.madeBy}</a></p>
        </div>
      </div>
    </footer>
  );
}
