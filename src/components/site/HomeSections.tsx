/**
 * The sections of a hotel's home page. Each one is independent, so a hotel's page
 * can drop or reorder sections without touching the others (see app/(site)/.../page.tsx).
 */
import Link from "next/link";
import { pick } from "@/lib/site/schema";
import { sitePath } from "@/lib/site/seo";
import { formatPrice } from "@/lib/site/strings";
import { mapsHref, whatsappHref } from "@/lib/site/links";
import { AmenityIcon, CheckIcon, RoomView, WalkRoute } from "./Art";
import type { SiteProps } from "./SiteChrome";

const wrap = "mx-auto max-w-6xl px-4 sm:px-6";
const h2 = "text-3xl font-bold tracking-tight sm:text-4xl";

export function Hero({ hotel, site, lang, s }: SiteProps) {
  const { location } = site;
  return (
    <section className={`${wrap} grid items-center gap-8 pb-12 pt-10 md:grid-cols-[1fr_1.1fr] md:pt-16`}>
      <div>
        <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-balance sm:text-6xl">{pick(site.tagline, lang)}</h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-hotel-ink/75">{pick(site.intro, lang)}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={sitePath(hotel.slug, lang, "book")} className="rounded-lg bg-hotel px-6 py-3.5 font-semibold text-white hover:bg-hotel/90">
            {s.book}
          </Link>
          <a href={whatsappHref(site.contact.whatsapp)} className="rounded-lg border-2 border-hotel/30 px-6 py-3 font-semibold text-hotel hover:border-hotel">
            {s.whatsapp}
          </a>
        </div>
      </div>
      <figure className="relative">
        <WalkRoute className="h-auto w-full rtl:-scale-x-100" />
        <figcaption className="mt-2 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-hotel-ink/10 pt-3">
          <span className="text-2xl font-bold text-hotel">{s.walk(location.walkMinutesToHaram)}</span>
          <span className="text-hotel-ink/70">{s.viaGate(pick(location.gate, lang))}</span>
        </figcaption>
      </figure>
    </section>
  );
}

export function Perks({ site, lang, s }: SiteProps) {
  return (
    <section aria-labelledby="perks-title" className="border-y border-hotel-ink/10 bg-surface">
      <div className={`${wrap} flex flex-col gap-4 py-6 lg:flex-row lg:items-center lg:gap-10`}>
        <h2 id="perks-title" className="shrink-0 font-bold">{s.perksTitle}</h2>
        <ul className="grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:flex lg:flex-wrap">
          {site.perks.map((perk) => (
            <li key={perk.en} className="flex gap-2">
              <CheckIcon className="mt-0.5 size-5 shrink-0 text-hotel" />
              <span>{pick(perk, lang)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Rooms({ hotel, site, lang, s }: SiteProps) {
  return (
    <section id="rooms" aria-labelledby="rooms-title" className={`${wrap} scroll-mt-20 py-16`}>
      <h2 id="rooms-title" className={h2}>{s.roomsTitle}</h2>
      <p className="mt-2 max-w-2xl text-hotel-ink/70">{s.roomsIntro}</p>
      <ul className="mt-10 divide-y divide-hotel-ink/10 border-y border-hotel-ink/10">
        {site.rooms.map((room) => (
          <li key={room.id} className="grid gap-5 py-8 sm:grid-cols-[150px_1fr] md:grid-cols-[170px_1fr_auto] md:gap-8">
            {/* The arch frame is the site's signature shape: the windows and gates of Madinah. */}
            <div className="aspect-[5/6] w-36 overflow-hidden rounded-t-full border-4 border-white shadow-[0_0_0_1px_rgb(0_0_0/0.08)] sm:w-full">
              <RoomView view={room.view} className="size-full" />
            </div>
            <div className="min-w-0">
              <h3 className="text-2xl font-bold">{pick(room.name, lang)}</h3>
              <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[15px] text-hotel-ink/70">
                <li>{s.views[room.view]}</li>
                <li>{s.sqm(room.sizeSqm)}</li>
                <li>{s.upToGuests(room.maxGuests)}</li>
                <li>{pick(room.beds, lang)}</li>
                {room.accessible && <li className="font-semibold text-hotel">{s.accessible}</li>}
              </ul>
              <p className="mt-3 max-w-xl leading-relaxed">{pick(room.description, lang)}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {room.features.map((f) => (
                  <li key={f.en} className="rounded-md bg-surface px-2.5 py-1 text-sm">{pick(f, lang)}</li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col items-start gap-3 md:items-end md:text-end">
              <p className="text-lg font-bold">{s.fromPerNight(formatPrice(room.fromPrice))}</p>
              <Link
                href={`${sitePath(hotel.slug, lang, "book")}?room=${room.id}`}
                className="rounded-lg border-2 border-hotel px-4 py-2 font-semibold text-hotel hover:bg-hotel hover:text-white"
              >
                {s.requestRoom}
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Offers({ hotel, site, lang, s }: SiteProps) {
  if (site.offers.length === 0) return null;
  return (
    <section id="offers" aria-labelledby="offers-title" className="scroll-mt-20 bg-surface py-16">
      <div className={wrap}>
        <h2 id="offers-title" className={h2}>{s.offersTitle}</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {site.offers.map((offer) => (
            <article key={offer.id} className="border-t-4 border-hotel-accent bg-white p-6 sm:p-8">
              <h3 className="text-2xl font-bold">{pick(offer.title, lang)}</h3>
              <p className="mt-1 text-[15px] font-semibold text-hotel">{pick(offer.validity, lang)}</p>
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
              <Link href={sitePath(hotel.slug, lang, "book")} className="mt-6 inline-block font-semibold text-hotel underline underline-offset-4">
                {s.book}
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
    <section aria-labelledby="groups-title" className="bg-hotel text-white">
      <div className={`${wrap} flex flex-col items-start gap-6 py-12 md:flex-row md:items-center md:justify-between`}>
        <div className="max-w-2xl">
          <h2 id="groups-title" className="text-3xl font-bold tracking-tight">{s.groupsTitle}</h2>
          <p className="mt-2 text-lg text-white/85">{s.groupsBody}</p>
        </div>
        <Link
          href={`${sitePath(hotel.slug, lang, "book")}?group=1`}
          className="shrink-0 rounded-lg bg-white px-6 py-3.5 font-semibold text-hotel hover:bg-white/90"
        >
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
      <dl className="mt-8 grid gap-px overflow-hidden border border-hotel-ink/10 bg-hotel-ink/10 sm:grid-cols-3">
        {rows.map((r) => (
          <div key={r.label} className="bg-white p-6">
            <dt className="text-hotel-ink/70">{r.label}</dt>
            <dd className="mt-1 text-3xl font-bold text-hotel">{r.value}</dd>
            {r.note && <dd className="mt-1 text-[15px]">{r.note}</dd>}
          </div>
        ))}
      </dl>
      <a href={mapsHref(location.lat, location.lng)} className="mt-6 inline-block font-semibold text-hotel underline underline-offset-4">
        {s.openMap}
      </a>
    </section>
  );
}

export function Facilities({ site, lang, s }: SiteProps) {
  if (site.amenities.length === 0) return null;
  return (
    <section aria-labelledby="facilities-title" className="bg-surface py-16">
      <div className={wrap}>
        <h2 id="facilities-title" className={h2}>{s.facilitiesTitle}</h2>
        <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-4">
          {site.amenities.map((a) => (
            <li key={a.label.en} className="flex items-center gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-hotel">
                <AmenityIcon name={a.icon} />
              </span>
              <span>{pick(a.label, lang)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Faq({ site, lang, s }: SiteProps) {
  if (site.faqs.length === 0) return null;
  return (
    <section id="faq" aria-labelledby="faq-title" className={`${wrap} scroll-mt-20 py-16`}>
      <h2 id="faq-title" className={h2}>{s.faqTitle}</h2>
      <div className="mt-8 max-w-3xl divide-y divide-hotel-ink/10 border-y border-hotel-ink/10">
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
    </section>
  );
}

export function Policies({ site, lang, s }: SiteProps) {
  const { policies } = site;
  const items = [
    { term: s.checkIn, value: s.from(policies.checkIn) },
    { term: s.checkOut, value: s.by(policies.checkOut) },
    { term: s.cancellation, value: pick(policies.cancellation, lang) },
    { term: s.children, value: pick(policies.children, lang) },
  ];
  return (
    <section aria-labelledby="policies-title" className={`${wrap} pb-16`}>
      <h2 id="policies-title" className="text-2xl font-bold">{s.policiesTitle}</h2>
      <dl className="mt-6 grid max-w-4xl gap-x-10 gap-y-5 sm:grid-cols-2">
        {items.map((i) => (
          <div key={i.term}>
            <dt className="font-semibold">{i.term}</dt>
            <dd className="mt-1 text-hotel-ink/80">{i.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
