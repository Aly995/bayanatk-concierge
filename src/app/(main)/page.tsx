import Link from "next/link";
import { Logo } from "@/components/Logo";
import { config, isDemoMode } from "@/lib/config";
import { DEMO_HOTEL } from "@/data/demo-hotel";

export default function Home() {
  const slug = DEMO_HOTEL.slug;
  return (
    <main className="mx-auto flex min-h-full max-w-4xl flex-col gap-10 px-4 py-12 sm:px-8">
      <header className="flex items-center justify-between">
        <Logo size={22} />
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-muted">
          {isDemoMode ? "Demo mode" : "Live mode"} · AI: {config.ai.useMock ? "offline demo" : config.ai.model}
        </span>
      </header>

      <section className="flex flex-col gap-3">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-deep">Bayanatk Concierge</p>
        <h1 className="text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
          Every guest answered, in their language, day and night
        </h1>
        <p dir="rtl" lang="ar" className="text-2xl font-semibold text-brand-deep">
          كل ضيف يحصل على رد بلغته، ليلاً ونهاراً
        </p>
        <p className="max-w-2xl text-muted">
          The AI answers questions from the hotel&apos;s own information, turns requests into tasks for staff, and hands
          anything sensitive to a person.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href={`/h/${slug}`} className="group rounded-2xl border border-line bg-white p-6 transition hover:border-brand">
          <p className="text-xs font-bold uppercase tracking-widest text-brand">For guests</p>
          <h2 className="mt-2 text-xl font-extrabold">Open the guest chat →</h2>
          <p className="mt-1 text-sm text-muted">What a guest sees after scanning the QR code in their room.</p>
        </Link>
        <Link href={`/dashboard/${slug}`} className="group rounded-2xl border border-line bg-white p-6 transition hover:border-brand">
          <p className="text-xs font-bold uppercase tracking-widest text-brand">For staff</p>
          <h2 className="mt-2 text-xl font-extrabold">Open the staff inbox →</h2>
          <p className="mt-1 text-sm text-muted">Live conversations, requests to action, booking requests and the pilot report.</p>
        </Link>
        <Link href={`/site/${slug}/en`} className="group rounded-2xl border border-line bg-white p-6 transition hover:border-brand">
          <p className="text-xs font-bold uppercase tracking-widest text-brand">Hotel website</p>
          <h2 className="mt-2 text-xl font-extrabold">Open the sample website →</h2>
          <p className="mt-1 text-sm text-muted">Rooms, offers and direct booking requests, in English and Arabic.</p>
        </Link>
      </section>

      {isDemoMode && (
        <p className="rounded-xl bg-mint-soft p-4 text-sm text-ink">
          <b>Demo mode:</b> a sample hotel, data kept in memory, and offline AI replies. Add your keys in{" "}
          <code>.env.local</code> (see <code>.env.example</code>) to switch to Claude and Supabase.
        </p>
      )}
    </main>
  );
}
