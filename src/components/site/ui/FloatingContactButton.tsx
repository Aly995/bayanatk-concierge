"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { SiteLanguage } from "@/lib/site/schema";
import { SITE_STRINGS } from "@/lib/site/strings";
import { HotelMark } from "./HotelMark";
import { Icon } from "./Icon";
import { WHATSAPP_GREEN, WhatsAppIcon } from "./WhatsAppIcon";

/**
 * One round button in the corner that opens two choices: WhatsApp, and the hotel's
 * AI assistant (in a panel). Pages reserve space at the bottom (see SiteFooter), so the
 * button never covers the last lines of content.
 */
export function FloatingContactButton(props: { lang: SiteLanguage; slug: string; whatsappHref: string; hotelName: string }) {
  const s = SITE_STRINGS[props.lang];
  const [menu, setMenu] = useState(false);
  const [chat, setChat] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const closeChatRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const shown = useShownAfterScroll();

  useEffect(() => {
    if (!menu && !chat) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMenu(false);
      setChat(false);
      buttonRef.current?.focus();
    };
    const onDown = (e: MouseEvent) => {
      if (menu && !rootRef.current?.contains(e.target as Node)) setMenu(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [menu, chat]);

  useEffect(() => {
    if (chat) closeChatRef.current?.focus();
  }, [chat]);

  const item = "flex w-full items-center gap-3 rounded-control px-3 py-2.5 text-start hover:bg-hotel/[0.06]";

  return (
    <div ref={rootRef}>
      {chat && (
        <div
          role="dialog"
          aria-label={s.chatTitle(props.hotelName)}
          className="fixed inset-0 z-50 flex flex-col bg-hotel-paper sm:inset-auto sm:bottom-24 sm:end-6 sm:h-[min(640px,calc(100dvh-8rem))] sm:w-[400px] sm:overflow-hidden sm:rounded-card sm:shadow-float sm:ring-1 sm:ring-hotel-ink/10"
        >
          <button
            ref={closeChatRef}
            type="button"
            onClick={() => {
              setChat(false);
              buttonRef.current?.focus();
            }}
            className="flex items-center justify-end gap-1 bg-hotel-deep px-4 py-2 text-[15px] font-semibold text-hotel-on-primary"
          >
            <Icon name="close" className="size-4" />
            {s.closeChat}
          </button>
          <iframe src={`/h/${props.slug}`} title={s.chatTitle(props.hotelName)} className="w-full flex-1 border-0" />
        </div>
      )}

      <div
        inert={!shown && !menu}
        className={`fixed bottom-4 end-4 z-40 flex flex-col items-end gap-3 motion-safe:transition-[opacity,translate] motion-safe:duration-300 sm:bottom-6 sm:end-6 ${
          shown || menu ? "opacity-100" : "pointer-events-none translate-y-3 opacity-0"
        }`}
      >
        {menu && (
          <div id={menuId} className="w-72 rounded-card bg-hotel-paper p-2 text-hotel-ink shadow-float ring-1 ring-hotel-ink/10">
            <a href={props.whatsappHref} target="_blank" rel="noopener" className={item} onClick={() => setMenu(false)}>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full text-white" style={{ backgroundColor: WHATSAPP_GREEN }}>
                <WhatsAppIcon className="size-5" />
              </span>
              <span className="font-semibold">{s.contact.whatsapp}</span>
            </a>
            <button
              type="button"
              className={item}
              onClick={() => {
                setMenu(false);
                setChat(true);
              }}
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-hotel text-hotel-accent">
                <HotelMark className="size-6" />
              </span>
              <span className="flex flex-col">
                <span className="font-semibold">{s.contact.assistant}</span>
                <span className="text-sm text-hotel-ink/65">{s.contact.assistantNote}</span>
              </span>
            </button>
          </div>
        )}
        <button
          ref={buttonRef}
          type="button"
          aria-expanded={menu}
          aria-controls={menu ? menuId : undefined}
          aria-label={menu ? s.contact.close : s.contact.open}
          onClick={() => setMenu((v) => !v)}
          className="flex size-14 items-center justify-center rounded-full bg-hotel text-hotel-on-primary shadow-float ring-2 ring-hotel-accent/70 transition-transform motion-safe:hover:scale-105"
        >
          <Icon name={menu ? "close" : "chat"} className="size-6" />
        </button>
      </div>
    </div>
  );
}

/** Phones: below this width the button waits until the guest scrolls past the booking bar. */
const PHONE_QUERY = "(max-width: 767px)";
const PHONE_SHOW_AFTER_PX = 560;

/**
 * True when the floating button should be visible. On a phone the hero's booking bar fills
 * the bottom of the first screen, so the button appears only after a short scroll instead of
 * covering the date field. On larger screens it is always visible.
 */
function useShownAfterScroll(): boolean {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const phone = window.matchMedia(PHONE_QUERY);
    const update = () => setShown(!phone.matches || window.scrollY > PHONE_SHOW_AFTER_PX);
    update();
    window.addEventListener("scroll", update, { passive: true });
    phone.addEventListener("change", update);
    return () => {
      window.removeEventListener("scroll", update);
      phone.removeEventListener("change", update);
    };
  }, []);
  return shown;
}
