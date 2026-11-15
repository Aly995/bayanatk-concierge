"use client";

import { LANGUAGE_LABELS } from "@/lib/i18n";
import type { PilotMetrics } from "@/lib/metrics";

const pct = (share: number) => `${Math.round(share * 100)}%`;

/** End-of-pilot numbers for the hotel manager. Printable (browser print / save as PDF). */
export function PilotReport({ metrics, hotelName }: { metrics: PilotMetrics | null; hotelName: string }) {
  if (!metrics) return <p className="text-sm text-muted">Loading…</p>;
  const m = metrics;
  const stats: { label: string; value: string; note?: string }[] = [
    { label: "Guest conversations", value: String(m.conversations), note: `${m.guestMessages} guest messages` },
    { label: "Answered by the AI alone", value: pct(m.handledByAiShare), note: `${m.aiReplies} AI replies` },
    { label: "Passed to staff", value: String(m.escalated), note: `${m.staffReplies} staff replies` },
    {
      label: "Staff first reply time (median)",
      value: m.medianStaffReplyMinutes === null ? "No data yet" : `${m.medianStaffReplyMinutes} min`,
    },
    { label: "Requests sent to staff", value: String(m.requestsCreated), note: `${m.requestsDone} done` },
    { label: "Direct booking requests", value: String(m.bookingRequests), note: `${m.bookingsConfirmed} confirmed` },
  ];
  const maxLang = Math.max(1, ...m.languages.map((l) => l.conversations));
  return (
    <section aria-labelledby="report-title" className="rounded-2xl border border-line bg-white p-6 print:border-0 print:p-0">
      <div className="flex flex-wrap items-baseline gap-3">
        <h2 id="report-title" className="text-xl font-extrabold">Pilot report: {hotelName}</h2>
        <span className="text-sm text-muted">Last {m.periodDays} days, to {new Date().toLocaleDateString("en-GB", { dateStyle: "long" })}</span>
        <button type="button" onClick={() => window.print()} className="ms-auto rounded-full border border-line px-3 py-1.5 text-xs font-bold print:hidden">
          Print or save as PDF
        </button>
      </div>
      <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((st) => (
          <div key={st.label} className="rounded-xl bg-surface p-4">
            <dt className="text-sm text-muted">{st.label}</dt>
            <dd className="mt-1 text-3xl font-extrabold">{st.value}</dd>
            {st.note && <dd className="text-sm text-muted">{st.note}</dd>}
          </div>
        ))}
      </dl>
      <h3 className="mt-8 font-bold">Guest languages</h3>
      {m.languages.length === 0 ? (
        <p className="mt-2 text-sm text-muted">No conversations yet.</p>
      ) : (
        <ul className="mt-3 max-w-xl space-y-2">
          {m.languages.map((l) => (
            <li key={l.language} className="grid grid-cols-[110px_1fr_40px] items-center gap-3 text-sm">
              <span>{LANGUAGE_LABELS[l.language]}</span>
              <span className="h-3 rounded-full bg-mint-soft">
                <span className="block h-3 rounded-full bg-brand" style={{ width: `${(l.conversations / maxLang) * 100}%` }} />
              </span>
              <span className="text-end font-semibold">{l.conversations}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-8 text-xs text-muted">Counted from the conversations, requests and booking requests stored for this hotel.</p>
    </section>
  );
}
