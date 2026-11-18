"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { MAX_NIGHTS } from "@/lib/booking";
import {
  addDays,
  addMonths,
  gregorianMonthLabel,
  hijriDate,
  hijriDay,
  hijriMonthSpan,
  isDisabled,
  longDate,
  monthGrid,
  monthOf,
  rangeNights,
  selectDay,
  shiftMonths,
  shortDate,
  weekdayNames,
  type DateRange,
  type ISODate,
} from "@/lib/site/dates";
import type { SiteLanguage } from "@/lib/site/schema";
import { SITE_STRINGS } from "@/lib/site/strings";
import { Icon } from "./Icon";

/**
 * Check-in and check-out in one control, with Hijri dates under the Gregorian ones and
 * the number of nights. Follows the WAI-ARIA date picker pattern: arrow keys move by day
 * and week (mirrored in Arabic), Page Up/Down by month, Home/End to the week's ends,
 * Enter or Space to pick, Escape to close.
 *
 * Use it inside a form with `names` (writes hidden inputs), or controlled with
 * `value` and `onChange`.
 */
export function DateRangePicker(props: {
  lang: SiteLanguage;
  today: ISODate;
  value?: DateRange;
  defaultValue?: DateRange;
  onChange?: (range: DateRange) => void;
  /** Hidden input names, for plain form submits. Submitting without dates is blocked. */
  names?: { start: string; end: string };
  maxNights?: number;
  invalid?: boolean;
  describedBy?: string;
}) {
  const s = SITE_STRINGS[props.lang];
  const rtl = props.lang === "ar";
  const rules = { today: props.today, maxNights: props.maxNights ?? MAX_NIGHTS };
  const [inner, setInner] = useState<DateRange>(props.defaultValue ?? { start: null, end: null });
  const range = props.value ?? inner;
  const setRange = (r: DateRange) => {
    if (!props.value) setInner(r);
    props.onChange?.(r);
  };

  const [open, setOpen] = useState(false);
  const [focus, setFocus] = useState<ISODate>(range.start ?? props.today);
  const [view, setView] = useState(() => monthOf(range.start ?? props.today));
  const [error, setError] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const gridRef = useRef<HTMLTableElement>(null);
  const dialogId = useId();
  const errorId = useId();
  const nights = rangeNights(range);

  // Block a form submit without dates (only when this picker writes hidden inputs).
  useEffect(() => {
    const form = rootRef.current?.closest("form");
    if (!form || !props.names) return;
    const onSubmit = (e: SubmitEvent) => {
      if (range.start && range.end) return;
      e.preventDefault();
      setError(true);
      setOpen(true);
    };
    form.addEventListener("submit", onSubmit);
    return () => form.removeEventListener("submit", onSubmit);
  }, [range.start, range.end, props.names]);

  // Close on outside click; focus the active day when the calendar opens.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);
  useEffect(() => {
    if (open) gridRef.current?.querySelector<HTMLButtonElement>(`[data-day="${focus}"]`)?.focus();
  }, [open, focus, view]);

  const grid = useMemo(() => monthGrid(view.year, view.month), [view]);
  const weekdays = useMemo(() => weekdayNames(props.lang), [props.lang]);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };
  const moveFocus = (iso: ISODate) => {
    setFocus(iso);
    setView(monthOf(iso));
  };
  const pick = (day: ISODate) => {
    const next = selectDay(range, day, rules);
    setRange(next);
    setError(false);
    if (next.start && next.end) close();
  };

  function onGridKey(e: React.KeyboardEvent) {
    const fwd = rtl ? -1 : 1; // Arrow keys follow what the eye sees.
    const steps: Record<string, () => ISODate> = {
      ArrowRight: () => addDays(focus, fwd),
      ArrowLeft: () => addDays(focus, -fwd),
      ArrowDown: () => addDays(focus, 7),
      ArrowUp: () => addDays(focus, -7),
      Home: () => addDays(focus, -new Date(`${focus}T00:00:00Z`).getUTCDay()),
      End: () => addDays(focus, 6 - new Date(`${focus}T00:00:00Z`).getUTCDay()),
      PageDown: () => shiftMonths(focus, 1),
      PageUp: () => shiftMonths(focus, -1),
    };
    if (steps[e.key]) {
      e.preventDefault();
      moveFocus(steps[e.key]!());
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  }

  const field = (label: string, iso: ISODate | null) => (
    <span className="flex min-w-0 flex-1 flex-col items-start px-3 py-2 text-start">
      <span className="text-xs font-semibold text-hotel-ink/65">{label}</span>
      <span className={`truncate text-[16px] ${iso ? "font-semibold text-hotel-ink" : "text-hotel-ink/55"}`}>
        {iso ? shortDate(iso, props.lang) : s.picker.choose}
      </span>
      {iso && <span className="truncate text-xs text-hotel-ink/60">{hijriDate(iso, props.lang)}</span>}
    </span>
  );

  return (
    <div ref={rootRef} className="relative">
      {props.names && (
        <>
          <input type="hidden" name={props.names.start} value={range.start ?? ""} />
          <input type="hidden" name={props.names.end} value={range.end ?? ""} />
        </>
      )}
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? dialogId : undefined}
        aria-invalid={props.invalid || error || undefined}
        aria-describedby={[error ? errorId : "", props.describedBy ?? ""].filter(Boolean).join(" ") || undefined}
        aria-label={`${s.picker.label}: ${range.start ? longDate(range.start, props.lang) : s.picker.choose}${range.end ? `, ${longDate(range.end, props.lang)}` : ""}${nights ? `, ${s.booking.nights(nights)}` : ""}`}
        onClick={() => {
          setFocus(range.start ?? props.today);
          setView(monthOf(range.start ?? props.today));
          setOpen((v) => !v);
        }}
        className={`flex w-full items-center rounded-control border bg-hotel-paper text-hotel-ink ${props.invalid || error ? "border-red-700" : "border-hotel-ink/20 hover:border-hotel/60"}`}
      >
        <Icon name="calendar" className="ms-3 size-5 shrink-0 text-hotel" />
        {field(s.bar.checkIn, range.start)}
        <span aria-hidden="true" className="h-8 w-px bg-hotel-ink/15" />
        {field(s.bar.checkOut, range.end)}
        {nights > 0 && (
          <span className="me-3 shrink-0 rounded-full bg-hotel/[0.08] px-2.5 py-1 text-xs font-semibold text-hotel">{s.booking.nights(nights)}</span>
        )}
      </button>
      {error && (
        <p id={errorId} className="mt-1.5 text-sm font-semibold text-red-700">
          {s.picker.required}
        </p>
      )}

      {open && (
        <div
          id={dialogId}
          role="dialog"
          aria-label={s.picker.dialog}
          className="absolute start-0 top-full z-40 mt-2 w-[min(23rem,calc(100vw-2rem))] rounded-card bg-hotel-paper p-4 text-hotel-ink shadow-card ring-1 ring-hotel-ink/10"
        >
          <div className="flex items-center justify-between gap-2">
            <button type="button" aria-label={s.picker.prevMonth} onClick={() => setView((v) => addMonths(v.year, v.month, -1))} className="rounded-full p-2 hover:bg-hotel/[0.07]">
              <Icon name="chevron-start" />
            </button>
            <div className="text-center" aria-live="polite">
              <p className="font-display text-lg font-medium text-hotel">{gregorianMonthLabel(view.year, view.month, props.lang)}</p>
              <p className="text-xs text-hotel-ink/65">{hijriMonthSpan(view.year, view.month, props.lang)}</p>
            </div>
            <button type="button" aria-label={s.picker.nextMonth} onClick={() => setView((v) => addMonths(v.year, v.month, 1))} className="rounded-full p-2 hover:bg-hotel/[0.07]">
              <Icon name="chevron-end" />
            </button>
          </div>

          <table ref={gridRef} role="grid" aria-label={gregorianMonthLabel(view.year, view.month, props.lang)} onKeyDown={onGridKey} className="mt-3 w-full border-collapse text-center">
            <thead>
              <tr>
                {weekdays.map((d) => (
                  <th key={d} scope="col" className="pb-1 text-xs font-medium text-hotel-ink/60">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grid.map((week, w) => (
                <tr key={w}>
                  {week.map((day, i) => {
                    if (!day) return <td key={i} />;
                    const disabled = isDisabled(day, range, rules);
                    const isStart = day === range.start;
                    const isEnd = day === range.end;
                    const inRange = !!(range.start && range.end && day > range.start && day < range.end);
                    const selected = isStart || isEnd;
                    return (
                      <td key={day} role="gridcell" aria-selected={selected || inRange} className={`p-0.5 ${inRange ? "bg-hotel/[0.07]" : ""}`}>
                        <button
                          type="button"
                          data-day={day}
                          tabIndex={day === focus ? 0 : -1}
                          disabled={disabled}
                          aria-label={`${longDate(day, props.lang)}, ${hijriDate(day, props.lang)}`}
                          aria-current={day === props.today ? "date" : undefined}
                          onClick={() => pick(day)}
                          onFocus={() => setFocus(day)}
                          className={`flex h-11 w-full flex-col items-center justify-center rounded-control leading-none transition-colors ${
                            selected
                              ? "bg-hotel text-hotel-on-primary"
                              : disabled
                                ? "cursor-not-allowed text-hotel-ink/25"
                                : "hover:bg-hotel/[0.1]"
                          } ${day === props.today && !selected ? "ring-1 ring-hotel-accent" : ""}`}
                        >
                          <span className="text-[15px] font-semibold">{Number(day.slice(8))}</span>
                          <span className={`mt-0.5 text-[10px] ${selected ? "text-hotel-on-primary/80" : "text-hotel-ink/50"}`}>{hijriDay(day, props.lang)}</span>
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-3 flex items-center justify-between gap-2 border-t border-hotel-ink/10 pt-3 text-sm">
            <span className="text-hotel-ink/75" aria-live="polite">
              {nights > 0 ? s.booking.nights(nights) : range.start ? s.picker.pickCheckOut : s.picker.dialog}
            </span>
            <span className="flex gap-1">
              <button type="button" onClick={() => setRange({ start: null, end: null })} className="rounded-control px-3 py-1.5 font-semibold text-hotel hover:bg-hotel/[0.07]">
                {s.picker.clear}
              </button>
              <button type="button" onClick={close} className="rounded-control bg-hotel px-3 py-1.5 font-semibold text-hotel-on-primary">
                {s.picker.done}
              </button>
            </span>
          </div>
          <p className="mt-2 text-[11px] text-hotel-ink/55">{s.picker.hijriNote}</p>
        </div>
      )}
    </div>
  );
}
