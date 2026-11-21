"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GeometricPattern } from "@/components/site/ui/GeometricPattern";
import { HotelMark } from "@/components/site/ui/HotelMark";
import { Icon } from "@/components/site/ui/Icon";
import { STARTER_CHIPS, followUpChips, type Chip } from "@/lib/chat/chips";
import { arCount } from "@/lib/site/strings";
import type { Message } from "@/lib/types";

const POLL_MS = 4000;

function getSessionId(slug: string): string {
  const key = `bayanatk-session-${slug}`;
  try {
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem(key, id);
    return id;
  } catch {
    // Storage blocked (private mode): fall back to a per-page session.
    return crypto.randomUUID();
  }
}

/**
 * The guest chat, styled with the hotel's colours (`hotel-*` classes read the CSS variables
 * set by the page). Guests write in any language; the interface itself is English and Arabic.
 */
export function GuestChat(props: { slug: string; name: string; nameAr: string; privacyHref: string; retentionDays: number }) {
  const { slug, name, nameAr } = props;
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);
  const sessionRef = useRef<string>("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sessionRef.current = getSessionId(slug);
  }, [slug]);

  // Keep the newest message in view. Scrolls only the message list (never the page around
  // it, which matters when the chat is embedded in the hotel website), and not before the
  // first message, so the welcome stays at the top.
  useEffect(() => {
    const list = listRef.current;
    if (!list || (messages.length === 0 && !sending)) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    list.scrollTo({ top: list.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  }, [messages, sending]);

  // Poll for staff replies once a conversation exists.
  useEffect(() => {
    if (!conversationId) return;
    const timer = setInterval(async () => {
      const res = await fetch(`/api/hotels/${slug}/conversations/${conversationId}/messages`);
      if (res.ok) setMessages((await res.json()).messages);
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [slug, conversationId]);

  const send = useCallback(
    async (value: string) => {
      const trimmed = value.trim();
      if (!trimmed || sending) return;
      setSending(true);
      setError(false);
      setText("");
      // Show the guest's message immediately.
      setMessages((m) => [
        ...m,
        { id: `local-${Date.now()}`, conversationId: conversationId ?? "", role: "guest", content: trimmed, createdAt: new Date().toISOString() },
      ]);
      try {
        const res = await fetch(`/api/hotels/${slug}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: sessionRef.current, text: trimmed }),
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setConversationId(data.conversationId);
        setMessages(data.messages);
      } catch {
        setError(true);
      } finally {
        setSending(false);
      }
    },
    [slug, conversationId, sending],
  );

  const followUps = sending ? [] : followUpChips(messages);

  return (
    <div className="mx-auto flex h-full max-w-xl flex-col overflow-hidden bg-hotel-paper text-hotel-ink sm:rounded-card sm:shadow-float sm:ring-1 sm:ring-hotel-ink/10">
      <header className="relative isolate flex items-center gap-3 overflow-hidden bg-hotel px-4 py-3.5 text-hotel-on-primary">
        <GeometricPattern opacity={0.14} size={56} className="-z-10" />
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-hotel-paper text-hotel ring-2 ring-hotel-accent">
          <HotelMark className="size-6" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-semibold leading-tight">{name}</p>
          <p className="truncate text-[13px] text-hotel-on-primary/80" dir="rtl" lang="ar">
            {nameAr} · مساعد الضيوف
          </p>
        </div>
        <span className="ms-auto inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-hotel-accent" />
          24/7
        </span>
      </header>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-hotel-surface px-3 py-5 sm:px-4" aria-live="polite">
        <AssistantRow>
          <p lang="en" dir="ltr">
            Welcome to {name}. Ask anything about your stay, in any language. I can also pass your requests to the front desk.
          </p>
          <p lang="ar" dir="rtl" className="mt-2 border-t border-hotel-ink/10 pt-2">
            أهلاً بك في {nameAr}. اسألني عن أي شيء يخص إقامتك وبأي لغة، ويمكنني أيضاً إيصال طلباتك إلى الاستقبال.
          </p>
        </AssistantRow>

        {messages.length === 0 && <ChipRow chips={STARTER_CHIPS} onPick={send} label="Example questions · أمثلة على الأسئلة" />}

        {messages.map((m) => (m.role === "guest" ? <GuestBubble key={m.id} message={m} /> : <AssistantRow key={m.id} staff={m.role === "staff"}>{m.content}</AssistantRow>))}

        {sending && <TypingIndicator />}
        {followUps.length > 0 && <ChipRow chips={followUps} onPick={send} label="Suggested questions · أسئلة مقترحة" />}
      </div>

      {error && (
        <p className="bg-warn-soft px-4 py-2 text-sm text-warn" role="alert">
          Message not sent. Check your connection and try again.{" "}
          <span lang="ar" dir="rtl">
            لم تُرسل الرسالة. تحقق من الاتصال وحاول مرة أخرى.
          </span>
        </p>
      )}

      <form
        className="flex items-center gap-2 border-t border-hotel-ink/10 bg-hotel-paper p-3"
        onSubmit={(e) => {
          e.preventDefault();
          send(text);
        }}
      >
        <label htmlFor="guest-message" className="sr-only">
          Message · رسالتك
        </label>
        <input
          id="guest-message"
          dir="auto"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message… · اكتب رسالتك"
          className="min-w-0 flex-1 rounded-full border border-hotel-ink/15 bg-hotel-surface px-4 py-3 text-[15px] placeholder:text-hotel-ink/50 focus:border-hotel focus:bg-hotel-paper"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          aria-label="Send · إرسال"
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-hotel text-hotel-on-primary transition-colors hover:bg-hotel-deep disabled:cursor-not-allowed disabled:bg-hotel/10 disabled:text-hotel/45"
        >
          <Icon name="send" className="size-5" />
        </button>
      </form>
      <p className="bg-hotel-paper px-4 pb-3 text-center text-[11px] leading-relaxed text-hotel-ink/70">
        Replies are written by AI from the hotel&apos;s information. Chats are deleted after {props.retentionDays} days.{" "}
        <a href={props.privacyHref} target="_blank" rel="noopener" className="underline">
          Privacy notice
        </a>
        <br />
        <span dir="rtl" lang="ar">
          الردود يكتبها مساعد ذكي من معلومات الفندق. تُحذف المحادثات بعد {arCount(props.retentionDays, ["يوم واحد", "يومان", "أيام", "يوماً"])}.{" "}
          <a href={props.privacyHref} target="_blank" rel="noopener" className="underline">
            إشعار الخصوصية
          </a>
        </span>
      </p>
    </div>
  );
}

/** A message from the hotel side: the assistant (hotel mark) or the front desk. */
function AssistantRow({ children, staff = false }: { children: React.ReactNode; staff?: boolean }) {
  return (
    <div className="flex items-end gap-2">
      <span
        aria-hidden="true"
        className={`mb-0.5 flex size-8 shrink-0 items-center justify-center rounded-full ${staff ? "bg-hotel-accent text-hotel-ink" : "bg-hotel text-hotel-on-primary"}`}
      >
        <HotelMark className="size-5" />
      </span>
      <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-bl-md bg-hotel-paper px-3.5 py-2.5 text-[15px] leading-relaxed shadow-sm ring-1 ring-hotel-ink/[0.06]" dir="auto">
        {staff && <span className="mb-0.5 block text-xs font-semibold text-hotel">Front desk · الاستقبال</span>}
        {children}
      </div>
    </div>
  );
}

function GuestBubble({ message }: { message: Message }) {
  return (
    <div className="flex justify-end">
      <div dir="auto" className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-hotel px-3.5 py-2.5 text-[15px] leading-relaxed text-hotel-on-primary">
        {message.content}
      </div>
    </div>
  );
}

/** Three dots in an assistant bubble while the reply is on its way. Still under reduced motion. */
function TypingIndicator() {
  return (
    <AssistantRow>
      <span role="status" className="flex h-6 items-center gap-1.5 px-1">
        <span className="sr-only">The assistant is typing · المساعد يكتب</span>
        {[0, 1, 2].map((i) => (
          <span key={i} aria-hidden="true" className="typing-dot size-2 rounded-full bg-hotel/60" style={{ animationDelay: `${i * 160}ms` }} />
        ))}
      </span>
    </AssistantRow>
  );
}

/** Suggestion chips, lined up with the assistant's bubbles. Each chip carries its language. */
function ChipRow({ chips, onPick, label }: { chips: Chip[]; onPick: (text: string) => void; label: string }) {
  return (
    <ul className="flex flex-wrap gap-2 ps-10" aria-label={label}>
      {chips.map((chip) => (
        <li key={chip.text}>
          <button
            type="button"
            lang={chip.lang}
            dir="auto"
            onClick={() => onPick(chip.text)}
            className="rounded-full border border-hotel/30 bg-hotel-paper px-3.5 py-1.5 text-sm text-hotel transition-colors hover:border-hotel hover:bg-hotel/[0.05]"
          >
            {chip.text}
          </button>
        </li>
      ))}
    </ul>
  );
}
