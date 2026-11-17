import type { Metadata } from "next";
import { ChatLauncher } from "@/components/site/ChatLauncher";
import { Facilities, FaqAndPolicies, Groups, Hero, KeyFacts, Location, Offers, Rooms, Welcome } from "@/components/site/HomeSections";
import { DemoBanner, hotelName, SiteFooter, SiteHeader, type SiteProps } from "@/components/site/SiteChrome";
import { todayInSaudi } from "@/lib/booking";
import { config } from "@/lib/config";
import { whatsappHref } from "@/lib/site/links";
import { loadSite } from "@/lib/site/load";
import { pick } from "@/lib/site/schema";
import { hotelJsonLd, jsonForScript, languageAlternates, sitePath } from "@/lib/site/seo";
import { SITE_STRINGS } from "@/lib/site/strings";

type Params = Promise<{ slug: string; lang: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug, lang: raw } = await params;
  const { hotel, site, lang } = await loadSite(slug, raw);
  return {
    metadataBase: new URL(config.site.baseUrl),
    title: `${hotelName(hotel, lang)}: ${pick(site.tagline, lang)}`,
    description: pick(site.intro, lang),
    alternates: languageAlternates(slug, lang),
    // Demo content is fictional: keep it out of search results.
    robots: site.isDemo ? { index: false, follow: false } : undefined,
  };
}

/** A hotel's home page. To change the order or drop a section for one hotel, edit this list. */
export default async function HotelHome({ params }: { params: Params }) {
  const { slug, lang: raw } = await params;
  const { hotel, site, lang } = await loadSite(slug, raw);
  const s = SITE_STRINGS[lang];
  const props: SiteProps = { hotel, site, lang, s };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonForScript(hotelJsonLd(hotel, site, lang, config.site.baseUrl)) }} />
      <DemoBanner {...props} />
      <SiteHeader {...props} />
      <main>
        <Hero {...props} today={todayInSaudi()} />
        <Rooms {...props} />
        <KeyFacts {...props} />
        <Welcome {...props} />
        <Facilities {...props} />
        <Offers {...props} />
        <Groups {...props} />
        <Location {...props} />
        <FaqAndPolicies {...props} />
      </main>
      <SiteFooter {...props} />
      <ChatLauncher
        slug={hotel.slug}
        whatsappHref={whatsappHref(site.contact.whatsapp)}
        bookHref={sitePath(hotel.slug, lang, "book")}
        labels={{
          askUs: s.askUs,
          askShort: s.askShort,
          bookShort: s.bookShort,
          closeChat: s.closeChat,
          whatsapp: s.whatsapp,
          chatTitle: s.chatTitle(hotelName(hotel, lang)),
        }}
      />
    </>
  );
}
