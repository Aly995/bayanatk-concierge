"use client";

import { LANGUAGE_LABELS } from "@/lib/i18n";
import { nightsBetween } from "@/lib/booking";
import { telHref, whatsappHref } from "@/lib/site/links";
import type { BookingRequest, BookingStatus } from "@/lib/types";

const STATUS_LABEL: Record<BookingStatus, string> = { new: "New", confirmed: "Confirmed", declined: "Declined", cancelled: "Cancelled" };
const STATUS_STYLE: Record<BookingStatus, string> = {
  new: "bg-warn-soft text-warn",
  confirmed: "bg-mint-soft text-brand-deep",
  declined: "bg-surface text-muted",
  cancelled: "bg-surface text-muted",
};
const ORDER: Record<BookingStatus, number> = { new: 0, confirmed: 1, declined: 2, cancelled: 3 };

const day = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

/** A first WhatsApp message to the guest, in their language. Only the reference: no personal data in the link. */
function firstMessage(b: BookingRequest, hotel: { name: string; nameAr: string }) {
  return b.language === "ar"
    ? `السلام عليكم، معك ${hotel.nameAr} بخصوص طلب الحجز رقم ${b.reference}.`
    : `Assalamu alaikum, this is ${hotel.name} about your booking request ${b.reference}.`;
}

export function BookingsBoard(props: {
  bookings: BookingRequest[];
  roomNames: Record<string, string>;
  hotel: { name: string; nameAr: string };
  onSetStatus: (id: string, status: BookingStatus) => void;
}) {
  const sorted = [...props.bookings].sort((a, b) => ORDER[a.status] - ORDER[b.status] || b.createdAt.localeCompare(a.createdAt));
  if (sorted.length === 0) {
    return <p className="rounded-2xl border border-line bg-white p-6 text-sm text-muted">No booking requests yet. They arrive here from the hotel website&apos;s booking form.</p>;
  }
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">
        Confirming here only updates the board. Message the guest on WhatsApp to agree the room and price.
      </p>
      <ul className="grid gap-3 xl:grid-cols-2">
        {sorted.map((b) => {
          const nights = nightsBetween(b.checkIn, b.checkOut);
          const guests = b.isGroup
            ? `Group of ${b.groupSize}`
            : `${b.adults} adult${b.adults === 1 ? "" : "s"}${b.children ? `, ${b.children} child${b.children === 1 ? "" : "ren"}` : ""}`;
          return (
            <li key={b.id} className="rounded-2xl border border-line bg-white p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-bold">{b.reference}</span>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${STATUS_STYLE[b.status]}`}>{STATUS_LABEL[b.status]}</span>
                <span className="rounded bg-surface px-1.5 py-0.5 text-xs font-semibold">{LANGUAGE_LABELS[b.language]}</span>
                <span className="ms-auto text-xs text-muted">Received {new Date(b.createdAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</span>
              </div>
              <p className="mt-3 font-bold">
                {day(b.checkIn)} to {day(b.checkOut)}, {nights} night{nights === 1 ? "" : "s"}
              </p>
              <p className="text-sm">{props.roomNames[b.roomId] ?? b.roomId}. {guests}.</p>
              <div className="mt-3 text-sm">
                <p dir="auto" className="font-semibold">{b.guestName}</p>
                <p className="flex flex-wrap gap-x-4">
                  <a href={telHref(b.phone)} dir="ltr" className="text-brand-deep underline">{b.phone}</a>
                  {b.email && <a href={`mailto:${b.email}`} className="break-all text-brand-deep underline">{b.email}</a>}
                  {b.country && <span dir="auto" className="text-muted">{b.country}</span>}
                </p>
              </div>
              {b.specialRequests && <p dir="auto" className="mt-2 whitespace-pre-wrap rounded-lg bg-surface px-3 py-2 text-sm">{b.specialRequests}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={whatsappHref(b.phone, firstMessage(b, props.hotel))}
                  target="_blank"
                  rel="noopener"
                  className="rounded-full border border-brand px-3 py-1.5 text-xs font-bold text-brand-deep"
                >
                  Message on WhatsApp
                </a>
                {b.status === "new" && (
                  <>
                    <button type="button" onClick={() => props.onSetStatus(b.id, "confirmed")} className="rounded-full bg-brand px-3 py-1.5 text-xs font-bold text-white">
                      Mark confirmed
                    </button>
                    <button type="button" onClick={() => props.onSetStatus(b.id, "declined")} className="rounded-full border border-line px-3 py-1.5 text-xs font-bold">
                      Decline
                    </button>
                  </>
                )}
                {b.status === "confirmed" && (
                  <button type="button" onClick={() => props.onSetStatus(b.id, "cancelled")} className="rounded-full border border-line px-3 py-1.5 text-xs font-bold">
                    Mark cancelled
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
