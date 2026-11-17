"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Contact buttons on hotel websites: the AI assistant (opens in a panel), WhatsApp and booking.
 * Phones get a fixed bar at the bottom; larger screens get floating buttons.
 * The chat is the same page guests reach from the QR code in their room (/h/<hotel>), loaded only when opened.
 */
export function ChatLauncher(props: {
  slug: string;
  whatsappHref: string;
  bookHref: string;
  labels: { askUs: string; askShort: string; bookShort: string; closeChat: string; whatsapp: string; chatTitle: string };
}) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label={props.labels.chatTitle}
          className="fixed inset-0 z-50 flex flex-col bg-white sm:inset-auto sm:bottom-24 sm:end-6 sm:h-[min(640px,calc(100dvh-8rem))] sm:w-[400px] sm:overflow-hidden sm:rounded-2xl sm:shadow-2xl sm:ring-1 sm:ring-black/10"
        >
          <button
            ref={closeRef}
            type="button"
            onClick={() => setOpen(false)}
            className="self-end px-4 py-2 text-[15px] font-semibold text-hotel"
          >
            {props.labels.closeChat}
          </button>
          <iframe src={`/h/${props.slug}`} title={props.labels.chatTitle} className="w-full flex-1 border-0" />
        </div>
      )}
      {/* Phones: a bar at the bottom, plus a spacer so it never covers the footer. */}
      <div aria-hidden="true" className="h-16 sm:hidden" />
      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 gap-2 border-t border-hotel-ink/10 bg-white p-2 sm:hidden">
        <button type="button" aria-expanded={open} onClick={() => setOpen(true)} className="rounded-lg border-2 border-hotel/30 py-2.5 font-semibold text-hotel">
          {props.labels.askShort}
        </button>
        <a href={props.whatsappHref} className="rounded-lg border-2 border-hotel/30 py-2.5 text-center font-semibold text-hotel">
          WhatsApp
        </a>
        <a href={props.bookHref} className="rounded-lg bg-hotel-accent py-2.5 text-center font-semibold text-hotel-ink">
          {props.labels.bookShort}
        </a>
      </div>
      <div className="fixed bottom-6 end-6 z-40 hidden flex-col items-end gap-2 sm:flex">
        <a
          href={props.whatsappHref}
          className="rounded-full bg-white px-4 py-2.5 text-[15px] font-semibold text-hotel shadow-lg ring-1 ring-black/10"
        >
          {props.labels.whatsapp}
        </a>
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="rounded-full bg-hotel px-5 py-3 font-semibold text-white shadow-lg hover:bg-hotel/90"
        >
          {open ? props.labels.closeChat : props.labels.askUs}
        </button>
      </div>
    </>
  );
}
