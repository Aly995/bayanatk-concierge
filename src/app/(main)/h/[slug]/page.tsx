import { notFound } from "next/navigation";
import { GuestChat } from "@/components/GuestChat";
import { config } from "@/lib/config";
import { brandStyle } from "@/lib/site/brand-style";
import { findSite } from "@/lib/site/load";
import { getStore } from "@/lib/store";

export default async function GuestChatPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const hotel = await getStore().getHotelBySlug(slug);
  if (!hotel) notFound();
  // Hotels with a website get their own colours; others use the default hotel palette.
  const site = await findSite(slug);
  return (
    <main className="site h-full bg-hotel-surface sm:py-6" style={brandStyle(site?.site.brand)}>
      <GuestChat
        slug={hotel.slug}
        name={hotel.name}
        nameAr={hotel.nameAr}
        privacyHref={`/h/${hotel.slug}/privacy`}
        retentionDays={config.privacy.retentionDays}
      />
    </main>
  );
}
