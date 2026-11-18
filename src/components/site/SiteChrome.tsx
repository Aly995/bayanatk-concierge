import Link from "next/link";
import type { HotelSite, SiteLanguage } from "@/lib/site/schema";
import { sitePath } from "@/lib/site/seo";
import type { SiteStrings } from "@/lib/site/strings";
import { mapsHref, telHref, whatsappHref } from "@/lib/site/links";
import { GeometricPattern } from "./ui/GeometricPattern";
import { Icon } from "./ui/Icon";
import { WalkMap } from "./ui/WalkMap";
import { WhatsAppIcon } from "./ui/WhatsAppIcon";
import type { Hotel } from "@/lib/types";

/** What every part of a hotel website receives. */
export type SiteProps = { hotel: Hotel; site: HotelSite; lang: SiteLanguage; s: SiteStrings };

export const hotelName = (hotel: Hotel, lang: SiteLanguage) => (lang === "ar" ? hotel.nameAr : hotel.name);

/** The page's one accent (10%) button style: gold with dark text, for the main action only. */
export const accentButton =
  "inline-flex items-center justify-center rounded-control bg-hotel-accent px-5 py-3 font-semibold text-hotel-ink hover:brightness-105 focus-visible:outline-hotel-on-primary";

export function DemoBanner({ site, s }: SiteProps) {
  if (!site.isDemo) return null;
  return <p className="bg-hotel-ink px-4 py-2 text-center text-sm text-hotel-on-primary/85">{s.demoBanner}</p>;
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
    <header className="sticky top-0 z-30 bg-hotel text-hotel-on-primary shadow-[0_1px_0_var(--color-hotel-deep)]">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link href={home} className="min-w-0 truncate font-display text-xl font-medium">
          {hotelName(hotel, lang)}
        </Link>
        <nav aria-label={s.sectionsLabel} className="ms-auto hidden gap-5 text-[15px] xl:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-hotel-on-primary/85 underline-offset-8 hover:text-hotel-on-primary hover:underline">
              {l.label}
            </a>
          ))}
        </nav>
        <a href={sitePath(hotel.slug, other)} hrefLang={other} lang={other} className="ms-auto shrink-0 text-[15px] hover:underline xl:ms-0">
          {s.otherLangName}
        </a>
        <Link href={sitePath(hotel.slug, lang, "book")} className={`${accentButton} shrink-0 px-4 py-2 text-[15px] max-sm:hidden`}>
          {s.book}
        </Link>
        <details className="group relative xl:hidden">
          <summary className="cursor-pointer list-none rounded-control border border-hotel-on-primary/30 px-3 py-1.5 text-[15px] [&::-webkit-details-marker]:hidden">
            {s.menu}
          </summary>
          <nav aria-label={s.sectionsLabel} className="absolute end-0 top-full mt-2 w-56 rounded-control bg-hotel-paper p-2 text-hotel-ink shadow-xl">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="block rounded-control px-3 py-2.5 hover:bg-hotel-surface">
                {l.label}
              </a>
            ))}
          </nav>
        </details>
      </div>
    </header>
  );
}

/**
 * Footer on a deeper shade of the main colour: contact (with WhatsApp), a small map,
 * language switch, privacy. The bottom padding keeps every line clear of the floating
 * contact button.
 */
export function SiteFooter({ hotel, site, lang, s }: SiteProps) {
  const other: SiteLanguage = lang === "ar" ? "en" : "ar";
  const link = "text-hotel-on-primary/85 underline-offset-4 hover:text-hotel-on-primary hover:underline";
  const head = "font-display text-lg font-medium";
  return (
    <footer className="relative isolate overflow-hidden bg-hotel-deep text-hotel-on-primary">
      <GeometricPattern opacity={0.08} size={80} className="-z-10" />
      <div className="mx-auto grid max-w-6xl gap-10 px-5 pb-28 pt-16 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.1fr_1.3fr_1.2fr_0.8fr]">
        <div>
          <p className="font-display text-2xl font-medium">{hotelName(hotel, lang)}</p>
          <p className="mt-3 max-w-xs text-hotel-on-primary/75">{site.location.address[lang]}</p>
          {site.licence && (
            <p className="mt-4 text-sm text-hotel-on-primary/75">
              {s.licence}: <span dir="ltr">{site.licence}</span>
            </p>
          )}
        </div>
        <div>
          <h2 className={head}>{s.contactTitle}</h2>
          <span aria-hidden="true" className="mt-3 block h-px w-10 bg-hotel-accent" />
          <ul className="mt-4 space-y-3">
            <li>
              <a href={whatsappHref(site.contact.whatsapp)} target="_blank" rel="noopener" className={`inline-flex items-center gap-2 ${link}`}>
                <WhatsAppIcon className="size-4" />
                {s.whatsapp}
              </a>
            </li>
            <li>
              <a href={telHref(site.contact.phone)} className={`inline-flex items-center gap-2 ${link}`}>
                <Icon name="phone" className="size-4" />
                <span dir="ltr">{site.contact.phone}</span>
              </a>
            </li>
            <li>
              <a href={`mailto:${site.contact.email}`} className={`inline-flex items-center gap-2 text-[15px] ${link}`}>
                <Icon name="mail" className="size-4 shrink-0" />
                {site.contact.email}
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h2 className={head}>{s.footer.findUs}</h2>
          <span aria-hidden="true" className="mt-3 block h-px w-10 bg-hotel-accent" />
          <a href={mapsHref(site.location.lat, site.location.lng)} target="_blank" rel="noopener" aria-label={`${s.footer.findUs}: ${s.openMap}`} className="mt-4 block">
            <WalkMap
              compact
              hotelName={hotelName(hotel, lang)}
              gateLabel={site.location.gate[lang]}
              minutesLabel={s.minutes(site.location.walkMinutesToHaram)}
              mosqueLabel=""
            />
          </a>
        </div>
        <div>
          <h2 className={head}>{s.footer.language}</h2>
          <span aria-hidden="true" className="mt-3 block h-px w-10 bg-hotel-accent" />
          <ul className="mt-4 space-y-3">
            <li>
              <span aria-current="true" className="font-semibold">{s.langName}</span>
            </li>
            <li>
              <a href={sitePath(hotel.slug, other)} hrefLang={other} lang={other} className={link}>
                {s.otherLangName}
              </a>
            </li>
          </ul>
          <ul className="mt-8 space-y-3 text-sm">
            <li><Link href={`/h/${hotel.slug}/privacy`} className={link}>{s.privacy}</Link></li>
            <li><a href="https://bayanatk.com" className={link}>{s.madeBy}</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
