/**
 * The sections of a hotel's home page, in the order of the page (modelled on established
 * Madinah hotel sites): hero with booking bar, rooms, key facts, welcome, facilities,
 * offers, groups, location, questions. Each section is independent, so a hotel's page can
 * drop or reorder sections in app/(site)/.../page.tsx without touching the others.
 *
 * Colour rule 60-30-10: off-white surfaces (60), the hotel's main colour for the hero,
 * headings, bands and footer (30), the accent only for the main buttons and small rules (10).
 */
import Link from "next/link";
import { pick } from "@/lib/site/schema";
import { sitePath } from "@/lib/site/seo";
import { formatPrice } from "@/lib/site/strings";
import { mapsHref } from "@/lib/site/links";
import { CheckIcon, FacilityArt, RoomView, WalkRoute } from "./Art";
import { accentButton, type SiteProps } from "./SiteChrome";
import { SitePhoto } from "./SitePhoto";

const wrap = "mx-auto max-w-6xl px-4 sm:px-6";
const h2 = "text-3xl font-bold tracking-tight text-hotel sm:text-4xl";
const rule = <span aria-hidden="true" className="block h-1 w-12 rounded-full bg-hotel-accent" />;
const outlineButton =
  "inline-flex items-center justify-center rounded-md border-2 border-hotel px-4 py-2 font-semibold text-hotel hover:bg-hotel hover:text-white";

export function Hero({ hotel, site, lang, s, today }: SiteProps & { today: string }) {
  const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
  const field = "mt-1 block w-full rounded-md border border-hotel-ink/20 bg-white px-3 py-2.5 text-[16px] text-hotel-ink";
  const label = "block text-sm font-semibold text-hotel-ink/70";
  return (
    <>
      <section className="bg-hotel text-white">
        <div className={`${wrap} grid items-end gap-10 pb-24 pt-10 md:grid-cols-[1fr_1.05fr] md:pb-28 md:pt-14`}>
          <div className="pb-2">
            <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-balance sm:text-6xl">{pick(site.tagline, lang)}</h1>
            <p className="mt-4 text-lg text-white/80">{s.viaGate(pick(site.location.gate, lang))}</p>
            <ul className="mt-7 grid gap-x-6 gap-y-2.5 sm:grid-cols-2" aria-label={s.perksTitle}>
              {site.perks.map((perk) => (
                <li key={perk.en} className="flex gap-2 text-[15px] text-white/90">
                  <CheckIcon className="mt-0.5 size-5 shrink-0 text-hotel-accent" />
                  {pick(perk, lang)}
                </li>
              ))}
            </ul>
          </div>
          {/* The arched window is the site's signature shape: the gates and windows of Madinah. */}
          <figure className="overflow-hidden rounded-t-[999px] bg-hotel-surface">
            <SitePhoto
              photo={site.heroPhoto}
              lang={lang}
              priority
              className="aspect-[4/3] w-full"
              fallback={<WalkRoute className="mt-14 h-auto w-full px-6 rtl:-scale-x-100" />}
            />
          </figure>
        </div>
      </section>

      {/* Booking bar: a plain form, so it works before any JavaScript loads. */}
      <div className={`${wrap} relative z-10 -mt-14`}>
        <form
          action={sitePath(hotel.slug, lang, "book")}
          method="get"
          aria-label={s.bar.label}
          className="grid gap-3 rounded-xl bg-white p-4 shadow-[0_12px_40px_-12px_rgb(0_0_0/0.25)] ring-1 ring-hotel-ink/5 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_0.6fr_0.6fr_auto] lg:items-end"
        >
          <label className={label}>
            {s.bar.checkIn}
            <input type="date" name="checkIn" min={today} required className={field} />
          </label>
          <label className={label}>
            {s.bar.checkOut}
            <input type="date" name="checkOut" min={today} required className={field} />
          </label>
          <label className={label}>
            {s.bar.adults}
            <select name="adults" defaultValue="2" className={field}>
              {range(1, 12).map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          <label className={label}>
            {s.bar.children}
            <select name="children" defaultValue="0" className={field}>
              {range(0, 12).map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          <button type="submit" className={`${accentButton} sm:col-span-2 lg:col-span-1`}>
            {s.bar.submit}
          </button>
        </form>
      </div>
    </>
  );
}

export function Rooms({ hotel, site, lang, s }: SiteProps) {
  return (
    <section id="rooms" aria-labelledby="rooms-title" className={`${wrap} scroll-mt-20 pb-16 pt-16`}>
      <h2 id="rooms-title" className={h2}>{s.roomsTitle}</h2>
      <p className="mt-2 max-w-2xl text-hotel-ink/70">{s.roomsIntro}</p>
      {/* Phones: a swipeable row of cards. Tablets and up: a grid. */}
      <ul className="-mx-4 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
        {site.rooms.map((room) => (
          <li key={room.id} className="flex w-[78%] shrink-0 snap-start flex-col sm:w-auto">
            <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] bg-white">
              <SitePhoto photo={room.photo} lang={lang} className="size-full" fallback={<RoomView view={room.view} className="size-full" />} />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-hotel-ink/90 via-hotel-ink/55 to-transparent px-4 pb-4 pt-14 text-white">
                <h3 className="text-xl font-bold">{pick(room.name, lang)}</h3>
                <p className="mt-0.5 text-sm text-white/85">
                  {s.upToGuests(room.maxGuests)}
                  {s.sep}
                  {s.sqm(room.sizeSqm)}
                </p>
              </div>
            </div>
            <p className="mt-3 text-[15px] text-hotel-ink/70">
              {pick(room.beds, lang)}
              {room.accessible && (
                <span className="font-semibold text-hotel">
                  {s.sep}
                  {s.accessible}
                </span>
              )}
            </p>
            <p className="mt-1 font-bold">{s.fromPerNight(formatPrice(room.fromPrice))}</p>
            <Link href={`${sitePath(hotel.slug, lang, "book")}?room=${room.id}`} className={`${outlineButton} mt-3 self-start`}>
              {s.requestRoom}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Facts guests decide on. Real facts only: no invented review or booking counts. */
export function KeyFacts({ site, lang, s }: SiteProps) {
  const facts = [
    { value: s.minutes(site.location.walkMinutesToHaram), label: s.facts.haram },
    { value: pick(site.location.gate, lang), label: s.facts.gate },
    { value: s.km(site.location.airportKm), label: s.facts.airport },
    { value: s.facts.whatsappValue, label: s.facts.whatsapp },
  ];
  return (
    <section className={wrap} aria-label={s.locationTitle}>
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-hotel-ink/10 ring-1 ring-hotel-ink/10 lg:grid-cols-4">
        {facts.map((f) => (
          <div key={f.label} className="flex flex-col-reverse bg-white px-5 py-6 text-center">
            <dt className="mt-1 text-[15px] text-hotel-ink/70">{f.label}</dt>
            <dd className="text-2xl font-bold text-hotel sm:text-3xl">{f.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function Welcome({ site, lang, s }: SiteProps) {
  return (
    <section aria-labelledby="welcome-title" className={`${wrap} flex flex-col items-center py-20 text-center`}>
      {rule}
      <h2 id="welcome-title" className={`${h2} mt-5`}>{site.welcomeTitle ? pick(site.welcomeTitle, lang) : s.welcomeTitle}</h2>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-hotel-ink/80">{pick(site.intro, lang)}</p>
    </section>
  );
}

export function Facilities({ site, lang, s }: SiteProps) {
  if (site.facilities.length === 0) return null;
  return (
    <section id="facilities" aria-labelledby="facilities-title" className="scroll-mt-20 bg-white py-16">
      <div className={wrap}>
        <h2 id="facilities-title" className={h2}>{s.facilitiesTitle}</h2>
        <div className="mt-10 space-y-12 md:space-y-16">
          {site.facilities.map((f, i) => (
            <article key={f.id} className={`grid items-center gap-6 md:gap-12 ${i % 2 === 1 ? "md:grid-cols-[6fr_5fr]" : "md:grid-cols-[5fr_6fr]"}`}>
              <div className={`overflow-hidden rounded-2xl ${i % 2 === 1 ? "md:order-2" : ""}`}>
                <SitePhoto photo={f.photo} lang={lang} className="aspect-[16/10] w-full" fallback={<FacilityArt icon={f.icon} className="aspect-[16/10] w-full" />} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-hotel">{pick(f.title, lang)}</h3>
                <p className="mt-3 max-w-lg text-lg leading-relaxed text-hotel-ink/80">{pick(f.text, lang)}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Offers({ hotel, site, lang, s }: SiteProps) {
  if (site.offers.length === 0) return null;
  return (
    <section id="offers" aria-labelledby="offers-title" className={`${wrap} scroll-mt-20 py-16`}>
      <h2 id="offers-title" className={h2}>{s.offersTitle}</h2>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {site.offers.map((offer) => (
          <article key={offer.id} className="flex flex-col rounded-xl border-t-4 border-hotel-accent bg-white p-6 shadow-sm ring-1 ring-hotel-ink/5 sm:p-8">
            <h3 className="text-2xl font-bold text-hotel">{pick(offer.title, lang)}</h3>
            <p className="mt-1 text-[15px] font-semibold text-hotel-ink/70">{pick(offer.validity, lang)}</p>
            <p className="mt-3 leading-relaxed">{pick(offer.description, lang)}</p>
            <h4 className="mt-5 text-sm font-semibold text-hotel-ink/70">{s.includes}</h4>
            <ul className="mt-2 space-y-1.5">
              {offer.includes.map((item) => (
                <li key={item.en} className="flex gap-2">
                  <CheckIcon className="mt-0.5 size-5 shrink-0 text-hotel" />
                  {pick(item, lang)}
                </li>
              ))}
            </ul>
            <Link href={sitePath(hotel.slug, lang, "book")} className={`${outlineButton} mt-6 self-start`}>
              {s.viewOffer}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

export function Groups({ hotel, lang, s }: SiteProps) {
  return (
    <section id="groups" aria-labelledby="groups-title" className="scroll-mt-20 bg-hotel text-white">
      <div className={`${wrap} flex flex-col items-start gap-6 py-14 md:flex-row md:items-center md:justify-between`}>
        <div className="max-w-2xl">
          <h2 id="groups-title" className="text-3xl font-bold tracking-tight">{s.groupsTitle}</h2>
          <p className="mt-2 text-lg text-white/85">{s.groupsBody}</p>
        </div>
        <Link href={`${sitePath(hotel.slug, lang, "book")}?group=1`} className={`${accentButton} shrink-0 px-6 py-3.5`}>
          {s.groupsCta}
        </Link>
      </div>
    </section>
  );
}

export function Location({ site, lang, s }: SiteProps) {
  const { location } = site;
  const rows = [
    { label: s.toHaram, value: s.walkShort(location.walkMinutesToHaram), note: s.viaGate(pick(location.gate, lang)) },
    { label: s.toTrain, value: s.km(location.trainStationKm) },
    { label: s.toAirport, value: s.km(location.airportKm) },
  ];
  return (
    <section id="location" aria-labelledby="location-title" className={`${wrap} scroll-mt-20 py-16`}>
      <h2 id="location-title" className={h2}>{s.locationTitle}</h2>
      <p className="mt-2 text-hotel-ink/70">{pick(location.address, lang)}</p>
      <dl className="mt-8 grid gap-px overflow-hidden rounded-xl bg-hotel-ink/10 ring-1 ring-hotel-ink/10 sm:grid-cols-3">
        {rows.map((r) => (
          <div key={r.label} className="bg-white p-6">
            <dt className="text-hotel-ink/70">{r.label}</dt>
            <dd className="mt-1 text-2xl font-bold text-hotel">{r.value}</dd>
            {r.note && <dd className="mt-1 text-[15px]">{r.note}</dd>}
          </div>
        ))}
      </dl>
      <a href={mapsHref(location.lat, location.lng)} className={`${outlineButton} mt-6`}>
        {s.openMap}
      </a>
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
    <section id="faq" aria-labelledby="faq-title" className="scroll-mt-20 bg-white py-16">
      <div className={`${wrap} grid gap-10 lg:grid-cols-[1.6fr_1fr]`}>
        <div>
          <h2 id="faq-title" className={h2}>{s.faqTitle}</h2>
          <div className="mt-8 divide-y divide-hotel-ink/10 border-y border-hotel-ink/10">
            {site.faqs.map((f) => (
              <details key={f.q.en} className="group py-1">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                  {pick(f.q, lang)}
                  <span aria-hidden="true" className="text-2xl leading-none text-hotel transition-transform group-open:rotate-45 motion-reduce:transition-none">+</span>
                </summary>
                <p className="pb-5 leading-relaxed text-hotel-ink/80">{pick(f.a, lang)}</p>
              </details>
            ))}
          </div>
        </div>
        <aside aria-labelledby="policies-title" className="h-fit rounded-xl bg-hotel-surface p-6">
          <h2 id="policies-title" className="text-xl font-bold text-hotel">{s.policiesTitle}</h2>
          <dl className="mt-4 space-y-4">
            {items.map((i) => (
              <div key={i.term}>
                <dt className="font-semibold">{i.term}</dt>
                <dd className="mt-0.5 text-[15px] text-hotel-ink/80">{i.value}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>
    </section>
  );
}
