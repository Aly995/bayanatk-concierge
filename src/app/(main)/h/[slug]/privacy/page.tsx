import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { config } from "@/lib/config";
import { PRIVACY_NOTICE_VERSION, privacySections } from "@/lib/privacy";
import { ltr } from "@/lib/site/strings";
import { getStore } from "@/lib/store";

export const metadata: Metadata = { title: "Privacy notice · إشعار الخصوصية", robots: { index: false } };

/** The guest privacy notice for one hotel, English and Arabic side by side. Linked from the chat and booking form. */
export default async function PrivacyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const store = getStore();
  const hotel = await store.getHotelBySlug(slug);
  if (!hotel) notFound();
  const site = await store.getHotelSite(hotel.id);
  const sections = privacySections({
    hotelName: { en: hotel.name, ar: hotel.nameAr },
    contact: { phone: site?.contact.phone, email: site?.contact.email },
    retentionDays: config.privacy.retentionDays,
    bookingRetentionDays: config.privacy.bookingRetentionDays,
  });
  return (
    <main className="mx-auto max-w-5xl bg-white px-4 py-10 sm:my-6 sm:rounded-3xl sm:border sm:border-line sm:px-10">
      <div className="grid gap-x-12 gap-y-2 md:grid-cols-2">
        <h1 className="contents">
          <span className="text-3xl font-extrabold tracking-tight">Privacy notice</span>
          <span lang="ar" dir="rtl" className="text-3xl font-extrabold">إشعار الخصوصية</span>
        </h1>
        <p className="text-muted">{hotel.name}. Last updated {PRIVACY_NOTICE_VERSION}.</p>
        <p lang="ar" dir="rtl" className="text-muted">{hotel.nameAr}. آخر تحديث {ltr(PRIVACY_NOTICE_VERSION)}.</p>
      </div>
      {sections.map((section) => (
        <section key={section.title.en} className="mt-8 grid gap-x-12 gap-y-3 border-t border-line pt-6 md:grid-cols-2">
          <div className="space-y-3">
            <h2 className="text-lg font-bold">{section.title.en}</h2>
            {section.body.map((p) => <p key={p.en} className="leading-relaxed">{p.en}</p>)}
          </div>
          <div lang="ar" dir="rtl" className="space-y-3">
            <h2 className="text-lg font-bold">{section.title.ar}</h2>
            {section.body.map((p) => <p key={p.ar} className="leading-relaxed">{p.ar}</p>)}
          </div>
        </section>
      ))}
    </main>
  );
}
