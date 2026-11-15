"use client";

import { useCallback, useEffect, useState } from "react";
import { Logo } from "./Logo";
import { BookingsBoard } from "./inbox/BookingsBoard";
import { PilotReport } from "./inbox/PilotReport";
import { LANGUAGE_LABELS } from "@/lib/i18n";
import type { PilotMetrics } from "@/lib/metrics";
import type { BookingRequest, BookingStatus, Conversation, Message, RequestStatus, ServiceRequest } from "@/lib/types";

type InboxConversation = Conversation & { lastMessage: string; messageCount: number };

const POLL_MS = 3000;
const STATUS_LABEL: Record<Conversation["status"], string> = { ai: "AI handling", needs_staff: "Needs staff", closed: "Closed" };
const REQUEST_COLUMNS: { status: RequestStatus; label: string }[] = [
  { status: "new", label: "New" },
  { status: "in_progress", label: "In progress" },
  { status: "done", label: "Done" },
];
const NEXT_STATUS: Record<RequestStatus, RequestStatus | null> = { new: "in_progress", in_progress: "done", done: null };

type Tab = "chats" | "bookings" | "report";

export function StaffInbox({ slug, hotelName, hotelNameAr, staffKey }: { slug: string; hotelName: string; hotelNameAr: string; staffKey: string }) {
  const [tab, setTab] = useState<Tab>("chats");
  const [conversations, setConversations] = useState<InboxConversation[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [roomNames, setRoomNames] = useState<Record<string, string>>({});
  const [metrics, setMetrics] = useState<PilotMetrics | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState("");
  const [error, setError] = useState<string | null>(null);

  const api = useCallback(
    (path: string, init?: RequestInit) =>
      fetch(`/api/hotels/${slug}${path}`, {
        ...init,
        headers: { "Content-Type": "application/json", "x-staff-key": staffKey, ...init?.headers },
      }),
    [slug, staffKey],
  );

  const refresh = useCallback(async () => {
    const res = await api("/inbox");
    if (res.status === 401) return setError("Staff access key required. Open this page with ?key=… from your manager.");
    if (!res.ok) return setError("Could not load the inbox. Retrying…");
    setError(null);
    const data = await res.json();
    setConversations(data.conversations);
    setRequests(data.requests);
    setBookings(data.bookings);
    setRoomNames(data.roomNames);
    setMetrics(data.metrics);
  }, [api]);

  const loadMessages = useCallback(async (id: string) => {
    const res = await api(`/conversations/${id}/messages`);
    if (res.ok) setMessages((await res.json()).messages);
  }, [api]);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, POLL_MS);
    return () => clearInterval(t);
  }, [refresh]);

  useEffect(() => {
    if (!selectedId && conversations[0]) setSelectedId(conversations[0].id);
  }, [conversations, selectedId]);

  useEffect(() => {
    if (!selectedId) return;
    loadMessages(selectedId);
    const t = setInterval(() => loadMessages(selectedId), POLL_MS);
    return () => clearInterval(t);
  }, [selectedId, loadMessages]);

  const selected = conversations.find((c) => c.id === selectedId) ?? null;

  async function sendReply() {
    if (!selectedId || !reply.trim()) return;
    const res = await api(`/conversations/${selectedId}/messages`, { method: "POST", body: JSON.stringify({ text: reply.trim() }) });
    if (res.ok) {
      setReply("");
      loadMessages(selectedId);
      refresh();
    } else setError("Reply not sent. Try again.");
  }

  async function setConversationStatus(status: Conversation["status"]) {
    if (!selectedId) return;
    await api(`/conversations/${selectedId}`, { method: "PATCH", body: JSON.stringify({ status }) });
    refresh();
  }

  async function moveRequest(r: ServiceRequest) {
    const next = NEXT_STATUS[r.status];
    if (!next) return;
    await api(`/requests/${r.id}`, { method: "PATCH", body: JSON.stringify({ status: next }) });
    refresh();
  }

  async function setBookingStatus(id: string, status: BookingStatus) {
    const res = await api(`/bookings/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
    if (!res.ok) setError("Booking not updated. Try again.");
    refresh();
  }

  const newBookings = bookings.filter((b) => b.status === "new").length;
  const tabs: { id: Tab; label: string }[] = [
    { id: "chats", label: "Guest chats" },
    { id: "bookings", label: newBookings ? `Booking requests (${newBookings} new)` : "Booking requests" },
    { id: "report", label: "Pilot report" },
  ];
  const needsStaff = conversations.filter((c) => c.status === "needs_staff").length;
  const aiHandled = conversations.filter((c) => c.status === "ai").length;

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-line bg-white px-4 py-3 sm:px-6 print:hidden">
        <Logo size={18} />
        <span className="font-bold">{hotelName}</span>
        <span className="text-sm text-muted">Staff inbox · صندوق الموظفين</span>
        <div className="flex flex-wrap gap-2 text-xs font-bold lg:ms-auto">
          <span className="rounded-full bg-mint-soft px-3 py-1.5 text-brand-deep">{aiHandled} handled by AI</span>
          <span className="rounded-full bg-warn-soft px-3 py-1.5 text-warn">{needsStaff} need staff</span>
          <span className="rounded-full bg-surface px-3 py-1.5 text-ink">{requests.filter((r) => r.status !== "done").length} open requests</span>
        </div>
      </header>

      <nav aria-label="Inbox sections" className="flex gap-1 overflow-x-auto border-b border-line bg-white px-4 sm:px-6 print:hidden">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-pressed={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-bold ${tab === t.id ? "border-brand text-brand-deep" : "border-transparent text-muted hover:text-ink"}`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {error && <p className="bg-warn-soft px-6 py-2 text-sm text-warn" role="alert">{error}</p>}

      {tab === "bookings" && (
        <div className="flex-1 p-4 sm:p-6">
          <BookingsBoard bookings={bookings} roomNames={roomNames} hotel={{ name: hotelName, nameAr: hotelNameAr }} onSetStatus={setBookingStatus} />
        </div>
      )}

      {tab === "report" && (
        <div className="flex-1 p-4 sm:p-6">
          <PilotReport metrics={metrics} hotelName={hotelName} />
        </div>
      )}

      {tab === "chats" && (
        <div className="grid flex-1 gap-4 p-4 lg:grid-cols-[300px_minmax(0,1fr)_340px] sm:p-6">
          {/* Conversations */}
          <section className="min-w-0 rounded-2xl border border-line bg-white" aria-label="Conversations">
            <h2 className="border-b border-line px-4 py-3 text-sm font-extrabold">Conversations</h2>
            {conversations.length === 0 && (
              <p className="p-4 text-sm text-muted">No guest messages yet. Open the guest chat in another tab and say hello.</p>
            )}
            <ul>
              {conversations.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(c.id)}
                    className={`w-full border-b border-line px-4 py-3 text-start ${c.id === selectedId ? "bg-mint-soft" : "hover:bg-surface"}`}
                  >
                    <div className="flex items-center gap-2 whitespace-nowrap text-xs">
                      <span className="rounded bg-surface px-1.5 py-0.5 font-semibold">{LANGUAGE_LABELS[c.language]}</span>
                      <span className="truncate text-muted">
                        {c.channel === "whatsapp" ? "WhatsApp" : "Web"}
                        {c.roomNumber && ` · ${c.roomNumber}`}
                      </span>
                      <span className="ms-auto"><StatusPill status={c.status} /></span>
                    </div>
                    <p dir="auto" className="mt-1 truncate text-sm">{c.lastMessage}</p>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {/* Selected conversation */}
          <section className="flex min-h-[420px] min-w-0 flex-col rounded-2xl border border-line bg-white" aria-label="Conversation">
            {selected ? (
              <>
                <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
                  <h2 className="text-sm font-extrabold">
                    {selected.roomNumber ? `Room ${selected.roomNumber}` : "Guest"} · {LANGUAGE_LABELS[selected.language]}
                  </h2>
                  <StatusPill status={selected.status} />
                  <div className="ms-auto flex gap-2">
                    {selected.status === "needs_staff" && (
                      <button type="button" onClick={() => setConversationStatus("ai")} className="rounded-full border border-brand px-3 py-1.5 text-xs font-bold text-brand-deep">
                        Hand back to AI
                      </button>
                    )}
                    {selected.status !== "closed" && (
                      <button type="button" onClick={() => setConversationStatus("closed")} className="rounded-full border border-line px-3 py-1.5 text-xs font-bold">
                        Close
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex-1 space-y-2 overflow-y-auto bg-surface p-4">
                  {messages.map((m) => (
                    <div key={m.id} className={`flex ${m.role === "guest" ? "justify-start" : "justify-end"}`}>
                      <div dir="auto" className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm ${m.role === "guest" ? "bg-white shadow-sm" : m.role === "staff" ? "bg-ink text-white" : "bg-mint"}`}>
                        <span className="mb-0.5 block text-[10px] font-bold uppercase tracking-wide opacity-70">
                          {m.role === "guest" ? "Guest" : m.role === "staff" ? "Staff" : "AI assistant"}
                        </span>
                        {m.content}
                      </div>
                    </div>
                  ))}
                </div>
                <form
                  className="flex gap-2 border-t border-line p-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendReply();
                  }}
                >
                  <label htmlFor="staff-reply" className="sr-only">Reply to guest</label>
                  <input
                    id="staff-reply"
                    dir="auto"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Reply as staff (takes over from the AI)…"
                    className="min-w-0 flex-1 rounded-full border border-line px-4 py-2.5 text-sm outline-none focus:border-brand"
                    autoComplete="off"
                  />
                  <button type="submit" disabled={!reply.trim()} className="rounded-full bg-ink px-4 text-sm font-bold text-white disabled:opacity-40">
                    Send
                  </button>
                </form>
              </>
            ) : (
              <p className="m-auto p-6 text-sm text-muted">Select a conversation.</p>
            )}
          </section>

          {/* Requests board */}
          <section className="min-w-0 rounded-2xl border border-line bg-white" aria-label="Requests">
            <h2 className="border-b border-line px-4 py-3 text-sm font-extrabold">Guest requests</h2>
            <div className="space-y-4 p-4">
              {REQUEST_COLUMNS.map((col) => {
                const items = requests.filter((r) => r.status === col.status);
                return (
                  <div key={col.status}>
                    <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">
                      {col.label} ({items.length})
                    </h3>
                    <ul className="space-y-2">
                      {items.map((r) => (
                        <li key={r.id} className="rounded-xl border border-line p-3">
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <span className="font-bold capitalize">{r.type.replace("_", " ")}</span>
                            <span className="text-muted">{r.roomNumber ? `Room ${r.roomNumber}` : "No room"}</span>
                          </div>
                          {r.details.split("\n").map((line, i) => (
                            <p key={i} dir="auto" className={i === 0 ? "mt-1 text-sm" : "mt-1 rounded-lg bg-surface px-2 py-1 text-sm text-muted"}>
                              {line}
                            </p>
                          ))}
                          {NEXT_STATUS[r.status] && (
                            <button type="button" onClick={() => moveRequest(r)} className="mt-2 rounded-full bg-brand px-3 py-1.5 text-xs font-bold text-white">
                              {r.status === "new" ? "Start" : "Mark done"}
                            </button>
                          )}
                        </li>
                      ))}
                      {items.length === 0 && <li className="text-xs text-muted">None</li>}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: Conversation["status"] }) {
  const cls =
    status === "needs_staff" ? "bg-warn-soft text-warn" : status === "ai" ? "bg-mint-soft text-brand-deep" : "bg-surface text-muted";
  return <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-bold ${cls}`}>{STATUS_LABEL[status]}</span>;
}
