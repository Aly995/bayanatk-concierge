"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { bookingInput, MAX_NIGHTS, nightsBetween, type BookingError } from "@/lib/booking";
import type { SiteLanguage } from "@/lib/site/schema";
import { formatPrice, SITE_STRINGS } from "@/lib/site/strings";

export type BookableRoom = { id: string; name: string; maxGuests: number; fromPrice: number };

type Step = 1 | 2 | 3 | "done";
type Fields = {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  isGroup: boolean;
  groupSize: string;
  roomId: string;
  guestName: string;
  phone: string;
  email: string;
  country: string;
  specialRequests: string;
  consent: boolean;
};
type FieldErrors = Partial<Record<keyof Fields, string>>;

/** Which step to send the guest back to when the server rejects a request. */
const ERROR_STEP: Record<BookingError, 1 | 2> = {
  unknown_room: 2,
  too_many_guests: 2,
  dates_invalid: 1,
  check_in_in_past: 1,
  too_many_nights: 1,
  group_size_required: 1,
};
const ERROR_FIELD: Record<BookingError, keyof Fields> = {
  unknown_room: "roomId",
  too_many_guests: "roomId",
  dates_invalid: "checkOut",
  check_in_in_past: "checkIn",
  too_many_nights: "checkOut",
  group_size_required: "groupSize",
};

/**
 * Three short steps: dates and guests, room, contact details.
 * No account, no card. The server validates everything again.
 */
export function BookingForm(props: {
  slug: string;
  lang: SiteLanguage;
  rooms: BookableRoom[];
  today: string;
  initialRoomId?: string;
  initialGroup?: boolean;
  homeHref: string;
  privacyHref: string;
}) {
  const s = SITE_STRINGS[props.lang].booking;
  const privacyLabel = SITE_STRINGS[props.lang].privacy;
  const [step, setStep] = useState<Step>(1);
  const [f, setF] = useState<Fields>({
    checkIn: "",
    checkOut: "",
    adults: 2,
    children: 0,
    isGroup: Boolean(props.initialGroup),
    groupSize: "",
    roomId: props.rooms.some((r) => r.id === props.initialRoomId) ? props.initialRoomId! : "",
    guestName: "",
    phone: "",
    email: "",
    country: "",
    specialRequests: "",
    consent: false,
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Move focus to the new step's heading, so screen readers announce it (not on first load).
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const set = <K extends keyof Fields>(key: K, value: Fields[K]) => {
    setF((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const nights = f.checkIn && f.checkOut ? nightsBetween(f.checkIn, f.checkOut) : 0;
  const partySize = f.isGroup ? Number(f.groupSize) || 0 : f.adults + f.children;

  function checkStep(current: 1 | 2 | 3): FieldErrors {
    const e: FieldErrors = {};
    if (current === 1) {
      if (!f.checkIn) e.checkIn = s.required;
      else if (f.checkIn < props.today) e.checkIn = s.errors.check_in_in_past;
      if (!f.checkOut) e.checkOut = s.required;
      else if (f.checkIn && nights < 1) e.checkOut = s.errors.dates_invalid;
      else if (nights > MAX_NIGHTS) e.checkOut = s.errors.too_many_nights;
      if (f.isGroup && !(Number(f.groupSize) >= 2)) e.groupSize = s.errors.group_size_required;
    }
    if (current === 2) {
      const room = props.rooms.find((r) => r.id === f.roomId);
      if (!room) e.roomId = s.errors.unknown_room;
      else if (!f.isGroup && partySize > room.maxGuests) e.roomId = s.errors.too_many_guests;
    }
    if (current === 3) {
      if (f.guestName.trim().length < 2) e.guestName = s.required;
      if (!/^\+?[0-9 ()-]{6,30}$/.test(f.phone.trim())) e.phone = f.phone.trim() ? s.phoneInvalid : s.required;
      if (f.email.trim() && !/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = s.emailInvalid;
      if (!f.consent) e.consent = s.consentRequired;
    }
    return e;
  }

  function showErrors(e: FieldErrors): boolean {
    setErrors(e);
    const first = Object.keys(e)[0];
    if (first) {
      // Focus the first field with a problem after React renders the messages.
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus());
      return false;
    }
    return true;
  }

  async function submit() {
    setFormError(null);
    const groupSize = f.isGroup ? Number(f.groupSize) : null;
    const payload = {
      roomId: f.roomId,
      checkIn: f.checkIn,
      checkOut: f.checkOut,
      adults: f.isGroup ? Math.min(Math.max(groupSize ?? 1, 1), 12) : f.adults,
      children: f.isGroup ? 0 : f.children,
      isGroup: f.isGroup,
      groupSize,
      guestName: f.guestName,
      phone: f.phone,
      email: f.email.trim() || null,
      country: f.country.trim() || null,
      language: props.lang,
      specialRequests: f.specialRequests.trim() || null,
      consent: f.consent,
    };
    if (!bookingInput.safeParse(payload).success) {
      setFormError(s.network);
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`/api/hotels/${props.slug}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.status === 201) {
        setReference((await res.json()).reference);
        setStep("done");
      } else if (res.status === 422) {
        const { error } = (await res.json()) as { error: BookingError };
        const back = ERROR_STEP[error] ?? 1;
        setStep(back);
        setErrors({ [ERROR_FIELD[error] ?? "checkIn"]: s.errors[error] ?? s.network });
      } else if (res.status === 429) {
        setFormError(s.tooMany);
      } else {
        setFormError(s.network);
      }
    } catch {
      setFormError(s.network);
    } finally {
      setSending(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step === "done") return;
    if (!showErrors(checkStep(step))) return;
    if (step === 3) submit();
    else setStep((step + 1) as Step);
  }

  if (step === "done") {
    return (
      <div className="max-w-xl" role="status">
        <h2 ref={headingRef} tabIndex={-1} className="text-3xl font-bold outline-none">{s.doneTitle}</h2>
        <p className="mt-3 text-lg">{s.doneBody}</p>
        <p dir="ltr" className="mt-4 inline-block rounded-lg bg-surface px-5 py-3 font-mono text-3xl font-bold tracking-widest text-hotel">
          {reference}
        </p>
        <p className="mt-8">
          <Link href={props.homeHref} className="font-semibold text-hotel underline underline-offset-4">{s.doneAgain}</Link>
        </p>
      </div>
    );
  }

  const field = "mt-1.5 block w-full rounded-lg border border-hotel-ink/25 bg-white px-3.5 py-3 text-[17px] outline-none focus:border-hotel focus:ring-2 focus:ring-hotel/25 aria-[invalid=true]:border-red-700";
  const label = "block font-semibold";
  const hint = "mt-1 block text-[15px] text-hotel-ink/65";
  const err = (key: keyof Fields) =>
    errors[key] ? (
      <span id={`${key}-error`} className="mt-1.5 block text-[15px] font-semibold text-red-700">{errors[key]}</span>
    ) : null;
  const aria = (key: keyof Fields, hintId?: string) => ({
    name: key,
    "aria-invalid": Boolean(errors[key]),
    "aria-describedby": [errors[key] ? `${key}-error` : "", hintId ?? ""].filter(Boolean).join(" ") || undefined,
  });
  const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="max-w-xl">
      <p className="font-semibold text-hotel">{s.step(step, 3)}</p>
      <h2 ref={headingRef} tabIndex={-1} className="mt-1 text-2xl font-bold outline-none">{s.stepNames[step - 1]}</h2>

      {step === 1 && (
        <div className="mt-6 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className={label}>
              {s.checkIn}
              <input type="date" min={props.today} value={f.checkIn} onChange={(e) => set("checkIn", e.target.value)} className={field} {...aria("checkIn")} />
              {err("checkIn")}
            </label>
            <label className={label}>
              {s.checkOut}
              <input type="date" min={f.checkIn || props.today} value={f.checkOut} onChange={(e) => set("checkOut", e.target.value)} className={field} {...aria("checkOut")} />
              {err("checkOut")}
            </label>
          </div>
          {nights > 0 && nights <= MAX_NIGHTS && <p className="text-hotel-ink/70">{s.nights(nights)}</p>}

          <label className="flex items-start gap-3 rounded-lg bg-surface p-4">
            <input type="checkbox" checked={f.isGroup} onChange={(e) => set("isGroup", e.target.checked)} className="mt-1 size-5 accent-[var(--hotel-primary)]" />
            <span className="font-semibold">{s.isGroup}</span>
          </label>

          {f.isGroup ? (
            <label className={label}>
              {s.groupSize}
              <input type="number" inputMode="numeric" min={2} max={500} value={f.groupSize} onChange={(e) => set("groupSize", e.target.value)} className={`${field} max-w-40`} {...aria("groupSize")} />
              {err("groupSize")}
            </label>
          ) : (
            <div className="grid grid-cols-2 gap-5">
              <label className={label}>
                {s.adults}
                <select value={f.adults} onChange={(e) => set("adults", Number(e.target.value))} className={field} name="adults">
                  {range(1, 12).map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>
              <label className={label}>
                {s.children}
                <select value={f.children} onChange={(e) => set("children", Number(e.target.value))} className={field} name="children" aria-describedby="children-hint">
                  {range(0, 12).map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
                <span id="children-hint" className={hint}>{s.childrenHint}</span>
              </label>
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <fieldset className="mt-6" aria-describedby={errors.roomId ? "roomId-error" : undefined}>
          <legend className="sr-only">{s.stepNames[1]}</legend>
          {err("roomId")}
          <div className="mt-2 space-y-3">
            {props.rooms.map((room) => {
              const tooSmall = !f.isGroup && partySize > room.maxGuests;
              return (
                <label
                  key={room.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 ${f.roomId === room.id ? "border-hotel bg-hotel/5" : "border-hotel-ink/15"} ${tooSmall ? "opacity-60" : ""}`}
                >
                  <input type="radio" name="roomId" value={room.id} checked={f.roomId === room.id} onChange={() => set("roomId", room.id)} className="mt-1 size-5 accent-[var(--hotel-primary)]" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{room.name}</span>
                    <span className="block text-[15px] text-hotel-ink/70">
                      {nights > 0 ? s.estimate(nights, formatPrice(nights * room.fromPrice)) : ""}
                    </span>
                    {tooSmall && <span className="block text-[15px] font-semibold text-red-700">{s.tooSmall(room.maxGuests)}</span>}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      {step === 3 && (
        <div className="mt-6 space-y-5">
          <label className={label}>
            {s.guestName}
            <input type="text" autoComplete="name" dir="auto" value={f.guestName} onChange={(e) => set("guestName", e.target.value)} className={field} {...aria("guestName")} />
            {err("guestName")}
          </label>
          <label className={label}>
            {s.phone}
            <input type="tel" inputMode="tel" autoComplete="tel" dir="ltr" value={f.phone} onChange={(e) => set("phone", e.target.value)} className={`${field} text-start`} {...aria("phone", "phone-hint")} />
            <span id="phone-hint" className={hint}>{s.phoneHint}</span>
            {err("phone")}
          </label>
          <label className={label}>
            {s.email}
            <input type="email" autoComplete="email" dir="ltr" value={f.email} onChange={(e) => set("email", e.target.value)} className={`${field} text-start`} {...aria("email")} />
            {err("email")}
          </label>
          <label className={label}>
            {s.country}
            <input type="text" autoComplete="country-name" dir="auto" value={f.country} onChange={(e) => set("country", e.target.value)} className={field} name="country" />
          </label>
          <label className={label}>
            {s.specialRequests}
            <textarea rows={3} dir="auto" maxLength={1000} value={f.specialRequests} onChange={(e) => set("specialRequests", e.target.value)} className={field} name="specialRequests" aria-describedby="requests-hint" />
            <span id="requests-hint" className={hint}>{s.specialRequestsHint}</span>
          </label>
          <div>
            <label className="flex items-start gap-3">
              <input type="checkbox" checked={f.consent} onChange={(e) => set("consent", e.target.checked)} className="mt-1 size-5 shrink-0 accent-[var(--hotel-primary)]" {...aria("consent")} />
              <span>
                {s.consent}{" "}
                <a href={props.privacyHref} target="_blank" rel="noopener" className="font-semibold text-hotel underline underline-offset-4">{privacyLabel}</a>.
              </span>
            </label>
            {err("consent")}
          </div>
        </div>
      )}

      {formError && <p role="alert" className="mt-6 rounded-lg bg-red-50 px-4 py-3 font-semibold text-red-800">{formError}</p>}

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button type="submit" disabled={sending} className="rounded-lg bg-hotel px-6 py-3.5 font-semibold text-white hover:bg-hotel/90 disabled:opacity-60">
          {step === 3 ? (sending ? s.sending : s.send) : s.next}
        </button>
        {step !== 1 && (
          <button type="button" onClick={() => setStep((step - 1) as Step)} className="px-4 py-3 font-semibold text-hotel">
            {s.back}
          </button>
        )}
      </div>
    </form>
  );
}
