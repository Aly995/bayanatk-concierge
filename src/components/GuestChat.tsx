"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Message } from "@/lib/types";

const SUGGESTIONS = [
  "What time is check-in?",
  "كم تبعد المسافة إلى الحرم؟",
  "Saya butuh handuk tambahan",
  "مجھے کل صبح ایئرپورٹ کے لیے ٹیکسی چاہیے",
  "Kahvaltı saat kaçta?",
];

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

export function GuestChat({ slug, name, nameAr }: { slug: string; name: string; nameAr: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionRef = useRef<string>("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sessionRef.current = getSessionId(slug);
  }, [slug]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      setError(null);
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
        setError("Message not sent. Check your connection and try again.");
      } finally {
        setSending(false);
      }
    },
    [slug, conversationId, sending],
  );

  return (
    <div className="mx-auto flex h-full max-w-xl flex-col bg-white sm:my-6 sm:h-[calc(100%-3rem)] sm:rounded-3xl sm:border sm:border-line sm:shadow-xl">
      <header className="flex items-center gap-3 bg-brand-deep px-4 py-3 text-white sm:rounded-t-3xl">
        <span className="flex size-10 items-center justify-center rounded-full bg-mint font-extrabold text-brand-deep">AI</span>
        <div className="min-w-0">
          <p className="truncate font-bold">{name}</p>
          <p className="truncate text-xs text-mint" dir="rtl" lang="ar">{nameAr} · مساعد الضيوف</p>
        </div>
        <span className="ms-auto rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold">24/7</span>
      </header>

      <div className="flex-1 space-y-2 overflow-y-auto bg-surface px-3 py-4" aria-live="polite">
        {messages.length === 0 && (
          <div className="space-y-3 py-6 text-center">
            <p className="font-semibold">Ask anything, in any language.</p>
            <p className="text-sm text-muted" dir="rtl" lang="ar">اسأل أي سؤال بأي لغة</p>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  dir="auto"
                  onClick={() => send(s)}
                  className="rounded-full border border-line bg-white px-3 py-2 text-sm hover:border-brand"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m) => (
          <Bubble key={m.id} message={m} />
        ))}
        {sending && <p className="px-2 text-xs text-muted">Typing…</p>}
        <div ref={endRef} />
      </div>

      {error && <p className="bg-warn-soft px-4 py-2 text-sm text-warn" role="alert">{error}</p>}

      <form
        className="flex gap-2 border-t border-line p-3"
        onSubmit={(e) => {
          e.preventDefault();
          send(text);
        }}
      >
        <label htmlFor="guest-message" className="sr-only">Message</label>
        <input
          id="guest-message"
          dir="auto"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message… · اكتب رسالتك"
          className="min-w-0 flex-1 rounded-full border border-line bg-surface px-4 py-3 text-[15px] outline-none focus:border-brand"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="rounded-full bg-brand px-5 font-bold text-white disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}

function Bubble({ message }: { message: Message }) {
  const mine = message.role === "guest";
  const staff = message.role === "staff";
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        dir="auto"
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[15px] leading-relaxed ${
          mine ? "rounded-br-md bg-mint" : "rounded-bl-md bg-white shadow-sm"
        }`}
      >
        {staff && <span className="mb-0.5 block text-[11px] font-bold text-brand-deep">Front desk · الاستقبال</span>}
        {message.content}
      </div>
    </div>
  );
}
