/**
 * The sections of a hotel's home page, in page order: hero with booking bar, key facts
 * (overlapping the hero), rooms, the walk to the Haram, welcome, facilities, guest
 * ratings, offers, Umrah groups, questions and policies. Each section is independent, so a
 * hotel's page can drop or reorder sections in app/(site)/.../page.tsx.
 *
 * Look: references/design-system.md. Colours, fonts, spacing and corners come from the
 * tokens in src/app/globals.css; sections alternate ivory, white and the main colour.
 */
import Link from "next/link";
import { pick } from "@/lib/site/schema";
import { sitePath } from "@/lib/site/seo";
import { formatPrice } from "@/lib/site/strings";
import { mapsHref } from "@/lib/site/links";
import { RoomView, WalkRoute } from "./Art";
import { accentButton, type SiteProps } from "./SiteChrome";
import { SitePhoto } from "./SitePhoto";
import { ArchImageCard } from "./ui/ArchImageCard";
import { DateRangePicker } from "./ui/DateRangePicker";
import { GeometricPattern } from "./ui/GeometricPattern";
import { Icon } from "./ui/Icon";
import { SectionDivider } from "./ui/SectionDivider";
import { SelectField } from "./ui/SelectField";
import { StatItem } from "./ui/StatItem";
import { WalkMap } from "./ui/WalkMap";

const wrap = "mx-auto max-w-6xl px-5 sm:px-6";
/** Vertical rhythm between sections: one token, tighter on phones. */
const section = "py-section-sm md:py-section";
const h2 = "font-display text-[2rem] font-medium leading-tight tracking-display text-hotel sm:text-[2.75rem]";
const lead = "mt-4 max-w-2xl text-lg leading-relaxed text-hotel-ink/75";
const outlineButton =
  "inline-flex items-center justify-center gap-2 rounded-control border border-hotel px-5 py-2.5 font-semibold text-hotel transition-colors hover:bg-hotel hover:text-hotel-on-primary";
const solidButton =
  "inline-flex items-center justify-center rounded-control bg-hotel px-5 py-2.5 font-semibold text-hotel-on-primary transition-colors hover:bg-hotel-deep";

/** Section heading with the brass divider above it. */
function Heading({ id, title, intro, center = false }: { id: string; title: string; intro?: string; center?: boolean }) {
  return (
    <div className={center ? "flex flex-col items-center text-center" : ""}>
      <SectionDivider className="mb-5" width="w-28" />
      <h2 id={id} className={h2}>
        {title}
      </h2>
      {intro && <p className={`${lead} ${center ? "mx-auto" : ""}`}>{intro}</p>}
    </div>
  );
}

export function Hero({ hotel, site, lang, s, today }: SiteProps & { today: string }) {
  return (
    <section className="relative isolate bg-hotel text-hotel-on-primary">
      {site.heroPhoto ? (
        <>
          <div aria-hidden="true" className="absolute inset-0 -z-20 overflow-hidden">
            <SitePhoto photo={site.heroPhoto} lang={lang} priority sizes="100vw" className="size-full" fallback={null} />
          </div>
          {/* Deep-green gradient keeps the white headline readable on any photo. */}
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-hotel/75 via-hotel/55 to-hotel/90" />
        </>
      ) : (
        <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
          <GeometricPattern opacity={0.16} size={96} />
        </div>
      )}
      <div className={`${wrap} pt-12 md:pt-20`}>
        <div className={`grid items-center gap-12 ${site.heroPhoto ? "min-h-[46vh]" : "md:grid-cols-[1.1fr_1fr]"}`}>
          <div>
            <h1 className="font-display text-[2.6rem] font-normal leading-[1.08] tracking-display text-balance sm:text-[4rem]">{pick(site.tagline, lang)}</h1>
            <p className="mt-5 text-lg text-hotel-on-primary/80 rtl:mt-7">{s.viaGate(pick(site.location.gate, lang))}</p>
            <ul className="mt-8 grid gap-x-6 gap-y-3 sm:grid-cols-2" aria-label={s.perksTitle}>
              {site.perks.map((perk) => (
                <li key={perk.en} className="flex gap-2.5 text-[15px] text-hotel-on-primary/90">
                  <Icon name="check" className="mt-0.5 size-5 shrink-0 text-hotel-accent" />
                  {pick(perk, lang)}
                </li>
              ))}
            </ul>
          </div>
          {/* No hero photo yet: the drawing shows in an arched window. */}
          {!site.heroPhoto && (
            <figure className="relative overflow-hidden rounded-t-arch bg-hotel-surface">
              <WalkRoute className="mt-14 h-auto w-full px-6 rtl:-scale-x-100" />
              <span aria-hidden="true" className="pointer-events-none absolute inset-2 rounded-t-arch border border-hotel-accent/60" />
            </figure>
          )}
        </div>
        <BookingBar hotel={hotel} site={site} lang={lang} s={s} today={today} />
        <KeyFacts hotel={hotel} site={site} lang={lang} s={s} />
      </div>
    </section>
  );
}

/** Dates, guests and Check availability. A plain GET form to the booking page. */
function BookingBar({ hotel, lang, s, today }: SiteProps & { today: string }) {
  return (
    <form
      action={sitePath(hotel.slug, lang, "book")}
      method="get"
      aria-label={s.bar.label}
      className="mt-12 grid gap-3 rounded-card bg-hotel-paper p-3 text-hotel-ink shadow-card sm:grid-cols-2 sm:p-4 lg:grid-cols-[2.2fr_0.7fr_0.7fr_auto] lg:items-end"
    >
      <div className="sm:col-span-2 lg:col-span-1">
        <DateRangePicker lang={lang} today={today} names={{ start: "checkIn", end: "checkOut" }} />
      </div>
      <SelectField label={s.bar.adults} name="adults" min={1} max={12} defaultValue={2} />
      <SelectField label={s.bar.children} name="children" min={0} max={12} defaultValue={0} />
      <button type="submit" className={`${accentButton} py-3.5 sm:col-span-2 lg:col-span-1`}>
        {s.bar.submit}
      </button>
    </form>
  );
}

/**
 * Key facts strip, hanging over the bottom edge of the hero: it is the hero's last child,
 * shifted down with a transform so it does not change the hero's height. The rooms section
 * adds the same 3rem to its top padding. Real facts only.
 */
function KeyFacts({ site, lang, s }: SiteProps) {
  return (
    <div className="relative z-10 mt-6 translate-y-12 md:mt-8">
      <div className="grid grid-cols-1 divide-y divide-hotel-ink/10 rounded-card bg-hotel-paper shadow-card ring-1 ring-hotel-ink/5 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x lg:rtl:divide-x-reverse">
        <StatItem icon="walk" value={s.minutes(site.location.walkMinutesToHaram)} label={s.facts.haram} />
        <StatItem icon="gate" value={pick(site.location.gate, lang)} label={s.facts.gate} />
        <StatItem icon="plane" value={s.km(site.location.airportKm)} label={s.facts.airport} />
        <StatItem icon="chat" value={s.facts.whatsappValue} label={s.facts.whatsapp} />
      </div>
    </div>
  );
}

export function Rooms({ hotel, site, lang, s }: SiteProps) {
  return (
    <section id="rooms" aria-labelledby="rooms-title" className={`scroll-mt-20 pb-section-sm pt-[calc(var(--spacing-section-sm)+3rem)] md:pb-section md:pt-[calc(var(--spacing-section)+3rem)]`}>
      <div className={`${wrap} reveal`}>
        <Heading id="rooms-title" title={s.roomsTitle} intro={s.roomsIntro} />
        {/* Phones: a swipeable row of cards. Tablets and up: a grid. */}
        <ul className="-mx-5 mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
          {site.rooms.map((room) => (
            <li key={room.id} className="flex w-[80%] shrink-0 snap-start sm:w-auto">
              <ArchImageCard
                photo={room.photo}
                lang={lang}
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 80vw"
                fallback={<RoomView view={room.view} className="size-full" />}
                className="w-full"
              >
                <h3 className="mt-5 font-display text-[1.4rem] font-medium text-hotel">{pick(room.name, lang)}</h3>
                <ul className="mb-4 mt-3 space-y-1.5 text-sm text-hotel-ink/75">
                  <li className="flex items-center gap-2">
                    <Icon name="bed" className="size-4 shrink-0 text-hotel" />
                    {pick(room.beds, lang)}
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="size" className="size-4 shrink-0 text-hotel" />
                    {s.sqm(room.sizeSqm)}
                    {s.sep}
                    {s.upToGuests(room.maxGuests)}
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="view" className="size-4 shrink-0 text-hotel" />
                    {s.views[room.view]}
                  </li>
                  {room.accessible && (
                    <li className="flex items-center gap-2 font-semibold text-hotel">
                      <Icon name="accessible" className="size-4 shrink-0" />
                      {s.accessible}
                    </li>
                  )}
                </ul>
                <p className="mt-auto border-t border-hotel-ink/10 pt-4 font-semibold">{s.fromPerNight(formatPrice(room.fromPrice))}</p>
                <Link href={`${sitePath(hotel.slug, lang, "book")}?room=${room.id}`} className={`${solidButton} mt-3 w-full`}>
                  {s.requestRoom}
                </Link>
              </ArchImageCard>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** The walk to the Haram gate, as a map: the hotel's strongest selling point. */
export function WalkToHaram({ hotel, site, lang, s }: SiteProps) {
  const { location } = site;
  return (
    <section id="location" aria-labelledby="location-title" className={`scroll-mt-20 bg-hotel-paper ${section}`}>
      <div className={`${wrap} reveal grid items-center gap-12 md:grid-cols-[1fr_1.25fr]`}>
        <div>
          <Heading id="location-title" title={s.walkMap.title} intro={`${s.walk(location.walkMinutesToHaram)}. ${s.viaGate(pick(location.gate, lang))}.`} />
          <ul className="mt-8 space-y-3">
            {[
              { icon: "pin" as const, text: pick(location.address, lang) },
              { icon: "globe" as const, text: `${s.toTrain}: ${s.km(location.trainStationKm)}` },
              { icon: "plane" as const, text: `${s.toAirport}: ${s.km(location.airportKm)}` },
            ].map((row) => (
              <li key={row.text} className="flex items-start gap-3 text-hotel-ink/80">
                <Icon name={row.icon} className="mt-0.5 size-5 shrink-0 text-hotel" />
                {row.text}
              </li>
            ))}
          </ul>
          <a href={mapsHref(location.lat, location.lng)} target="_blank" rel="noopener" className={`${outlineButton} mt-8`}>
            <Icon name="pin" className="size-4" />
            {s.openMap}
          </a>
        </div>
        <WalkMap
          hotelName={lang === "ar" ? hotel.nameAr : hotel.name}
          gateLabel={pick(location.gate, lang)}
          minutesLabel={s.minutes(location.walkMinutesToHaram)}
          mosqueLabel={s.walkMap.mosque}
        />
      </div>
    </section>
  );
}

export function Welcome({ site, lang, s }: SiteProps) {
  return (
    <section aria-labelledby="welcome-title" className={`relative isolate overflow-hidden ${section}`}>
      {/* Faint star lattice behind the welcome, fading out towards the edges. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 [mask-image:radial-gradient(closest-side,black,transparent)]">
        <GeometricPattern color="var(--color-hotel)" opacity={0.09} size={120} />
      </div>
      <div className={`${wrap} reveal`}>
        <Heading id="welcome-title" title={site.welcomeTitle ? pick(site.welcomeTitle, lang) : s.welcomeTitle} intro={pick(site.intro, lang)} center />
      </div>
    </section>
  );
}

export function Facilities({ site, lang, s }: SiteProps) {
  if (site.facilities.length === 0) return null;
  // Image rows need a photo for every facility; until then, compact icon cards.
  const allPhotos = site.facilities.every((f) => f.photo);
  return (
    <section id="facilities" aria-labelledby="facilities-title" className={`scroll-mt-20 bg-hotel-paper ${section}`}>
      <div className={`${wrap} reveal`}>
        <Heading id="facilities-title" title={s.facilitiesTitle} />
        {allPhotos ? (
          <div className="mt-12 space-y-14 md:space-y-20">
            {site.facilities.map((f, i) => (
              <article key={f.id} className={`grid items-center gap-8 md:gap-14 ${i % 2 === 1 ? "md:grid-cols-[6fr_5fr]" : "md:grid-cols-[5fr_6fr]"}`}>
                <div className={`overflow-hidden rounded-card ${i % 2 === 1 ? "md:order-2" : ""}`}>
                  <SitePhoto photo={f.photo} lang={lang} sizes="(min-width: 768px) 45vw, 100vw" className="aspect-[16/10] w-full" fallback={null} />
                </div>
                <div>
                  <span className="flex size-11 items-center justify-center rounded-full bg-hotel/[0.07] text-hotel">
                    <Icon name={f.icon} className="size-5" />
                  </span>
                  <h3 className="mt-4 font-display text-2xl font-medium text-hotel">{pick(f.title, lang)}</h3>
                  <p className="mt-3 max-w-lg text-lg leading-relaxed text-hotel-ink/80">{pick(f.text, lang)}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <ul className="mt-12 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {site.facilities.map((f) => (
              <li key={f.id} className="flex gap-4">
                <span className="flex size-14 shrink-0 items-center justify-center rounded-t-arch rounded-b-control bg-hotel/[0.07] text-hotel">
                  <Icon name={f.icon} className="size-6" />
                </span>
                <div>
                  <h3 className="font-display text-xl font-medium text-hotel">{pick(f.title, lang)}</h3>
                  <p className="mt-2 leading-relaxed text-hotel-ink/80">{pick(f.text, lang)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

/**
 * Real guest ratings, entered from the hotel's public review profiles. Never invented:
 * without ratings, the demo shows a labelled placeholder and real hotels show nothing.
 */
export function GuestRatings({ site, s }: SiteProps) {
  if (site.ratings.length === 0 && !site.isDemo) return null;
  return (
    <section aria-labelledby="ratings-title" className={section}>
      <div className={`${wrap} reveal`}>
        <Heading id="ratings-title" title={s.ratings.title} />
        {site.ratings.length > 0 ? (
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {site.ratings.map((r) => (
              <li key={r.source}>
                <a href={r.url} target="_blank" rel="noopener" className="block rounded-card bg-hotel-paper p-6 shadow-card ring-1 ring-hotel-ink/5 hover:ring-hotel/30">
                  <p className="font-semibold text-hotel-ink/70">{r.source}</p>
                  <p className="mt-2 font-display text-4xl font-medium text-hotel">
                    {r.score} <span className="text-base text-hotel-ink/60">{s.ratings.outOf(r.outOf)}</span>
                  </p>
                  <p className="mt-1 text-sm text-hotel-ink/65">{s.ratings.reviews(r.count)}</p>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-10 flex flex-col items-start gap-4 rounded-card border-2 border-dashed border-hotel-ink/20 p-6 sm:flex-row sm:items-center sm:p-8">
            <span aria-hidden="true" className="flex gap-1 text-hotel-accent">
              {[0, 1, 2, 3, 4].map((i) => (
                <svg key={i} viewBox="0 0 24 24" className="size-6">
                  <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              ))}
            </span>
            <p className="max-w-2xl text-hotel-ink/75">{s.ratings.sampleNote}</p>
          </div>
        )}
      </div>
    </section>
  );
}

export function Offers({ hotel, site, lang, s }: SiteProps) {
  if (site.offers.length === 0) return null;
  return (
    <section id="offers" aria-labelledby="offers-title" className={`scroll-mt-20 bg-hotel-paper ${section}`}>
      <div className={`${wrap} reveal`}>
        <Heading id="offers-title" title={s.offersTitle} />
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {site.offers.map((offer) => (
            <article key={offer.id} className="flex flex-col rounded-card border-t-2 border-hotel-accent bg-hotel-surface p-7 sm:p-9">
              <h3 className="font-display text-2xl font-medium text-hotel">{pick(offer.title, lang)}</h3>
              <p className="mt-1 text-[15px] font-semibold text-hotel-ink/70">{pick(offer.validity, lang)}</p>
              <p className="mt-4 leading-relaxed">{pick(offer.description, lang)}</p>
              <h4 className="mt-6 text-sm font-semibold text-hotel-ink/70">{s.includes}</h4>
              <ul className="mt-2 space-y-2">
                {offer.includes.map((item) => (
                  <li key={item.en} className="flex gap-2.5">
                    <Icon name="check" className="mt-0.5 size-5 shrink-0 text-hotel" />
                    {pick(item, lang)}
                  </li>
                ))}
              </ul>
              <Link href={sitePath(hotel.slug, lang, "book")} className={`${outlineButton} mt-8 self-start`}>
                {s.viewOffer}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Groups({ hotel, lang, s }: SiteProps) {
  return (
    <section id="groups" aria-labelledby="groups-title" className="relative isolate scroll-mt-20 overflow-hidden bg-hotel text-hotel-on-primary">
      <GeometricPattern opacity={0.14} size={80} className="-z-10" />
      <div className={`${wrap} ${section} reveal flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between`}>
        <div className="max-w-2xl">
          <h2 id="groups-title" className="font-display text-[2rem] font-medium leading-tight tracking-display sm:text-[2.5rem]">{s.groupsTitle}</h2>
          <p className="mt-3 text-lg text-hotel-on-primary/85">{s.groupsBody}</p>
        </div>
        <Link href={`${sitePath(hotel.slug, lang, "book")}?group=1`} className={`${accentButton} shrink-0 px-7 py-3.5`}>
          {s.groupsCta}
        </Link>
      </div>
    </section>
  );
}

export function FaqAndPolicies({ site, lang, s }: SiteProps) {
  const { policies } = site;
  const items = [
    { term: s.checkIn, value: s.from(policies.checkIn) },
    { term: s.checkOut, value: s.by(policies.checkOut) },
    { term: s.cancellation, value: pick(policies.cancellation, lang) },
    { term: s.children, value: pick(policies.children, lang) },
  ];
  return (
    <section id="faq" aria-labelledby="faq-title" className={`scroll-mt-20 ${section}`}>
      <div className={`${wrap} reveal grid gap-12 lg:grid-cols-[1.6fr_1fr]`}>
        <div>
          <Heading id="faq-title" title={s.faqTitle} />
          <div className="mt-10 divide-y divide-hotel-ink/10 border-y border-hotel-ink/10">
            {site.faqs.map((f) => (
              <details key={f.q.en} className="group py-1">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                  {pick(f.q, lang)}
                  <Icon name="chevron-down" className="size-5 shrink-0 text-hotel transition-transform group-open:rotate-180 motion-reduce:transition-none" />
                </summary>
                <p className="pb-6 leading-relaxed text-hotel-ink/80">{pick(f.a, lang)}</p>
              </details>
            ))}
          </div>
        </div>
        <aside aria-labelledby="policies-title" className="h-fit rounded-card bg-hotel-paper p-7 shadow-card ring-1 ring-hotel-ink/5 lg:mt-24">
          <h2 id="policies-title" className="font-display text-xl font-medium text-hotel">{s.policiesTitle}</h2>
          <dl className="mt-5 space-y-5">
            {items.map((i) => (
              <div key={i.term}>
                <dt className="font-semibold">{i.term}</dt>
                <dd className="mt-1 text-[15px] text-hotel-ink/80">{i.value}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>
    </section>
  );
}
