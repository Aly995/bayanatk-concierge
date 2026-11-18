import type { Metadata } from "next";
import { BookingForm } from "@/components/site/BookingForm";
import { DemoBanner, hotelName, SiteFooter, SiteHeader, type SiteProps } from "@/components/site/SiteChrome";
import { todayInSaudi } from "@/lib/booking";
import { config } from "@/lib/config";
import { loadSite } from "@/lib/site/load";
import { pick } from "@/lib/site/schema";
import { languageAlternates, sitePath } from "@/lib/site/seo";
import { SITE_STRINGS } from "@/lib/site/strings";

type Params = Promise<{ slug: string; lang: string }>;
type Search = Promise<{ room?: string; group?: string; checkIn?: string; checkOut?: string; adults?: string; children?: string }>;

/** A whole number from a query string, kept inside [min, max]; otherwise the fallback. */
const intParam = (v: string | undefined, min: number, max: number, fallback: number) => {
  const n = Number.parseInt(v ?? "", 10);
  return Number.isFinite(n) && n >= min && n <= max ? n : fallback;
};
const dateParam = (v: string | undefined) => (v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : "");

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug, lang: raw } = await params;
  const { hotel, lang } = await loadSite(slug, raw);
  return {
    metadataBase: new URL(config.site.baseUrl),
    title: `${SITE_STRINGS[lang].booking.title}: ${hotelName(hotel, lang)}`,
    alternates: languageAlternates(slug, lang, "book"),
    robots: { index: false, follow: true },
  };
}

export default async function BookPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { slug, lang: raw } = await params;
  const { room, group, checkIn, checkOut, adults, children } = await searchParams;
  const { hotel, site, lang } = await loadSite(slug, raw);
  const s = SITE_STRINGS[lang];
  const props: SiteProps = { hotel, site, lang, s };
  return (
    <>
      <DemoBanner {...props} />
      <SiteHeader {...props} />
      <main className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 md:grid-cols-[1fr_320px] md:py-14">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-hotel">{s.booking.title}</h1>
          <p className="mt-3 max-w-xl text-lg text-hotel-ink/75">{s.booking.intro}</p>
          <div className="mt-10">
            <BookingForm
              slug={hotel.slug}
              lang={lang}
              today={todayInSaudi()}
              rooms={site.rooms.map((r) => ({ id: r.id, name: pick(r.name, lang), maxGuests: r.maxGuests, fromPrice: r.fromPrice }))}
              initialRoomId={room}
              initialGroup={group === "1"}
              initial={{
                checkIn: dateParam(checkIn),
                checkOut: dateParam(checkOut),
                adults: intParam(adults, 1, 12, 2),
                children: intParam(children, 0, 12, 0),
              }}
              homeHref={sitePath(hotel.slug, lang)}
              privacyHref={`/h/${hotel.slug}/privacy`}
            />
          </div>
        </div>
        <aside className="h-fit space-y-4 rounded-card bg-hotel-paper p-6 text-[15px] ring-1 ring-hotel-ink/10">
          <p className="font-bold text-hotel">{hotelName(hotel, lang)}</p>
          <p>{s.walk(site.location.walkMinutesToHaram)}</p>
          <p>
            {s.checkIn} {s.from(site.policies.checkIn)}
            <br />
            {s.checkOut} {s.by(site.policies.checkOut)}
          </p>
          <p>{pick(site.policies.cancellation, lang)}</p>
        </aside>
      </main>
      <SiteFooter {...props} />
    </>
  );
}
