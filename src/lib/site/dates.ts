/**
 * Calendar helpers for the date-range picker. Dates are plain `YYYY-MM-DD` strings in UTC,
 * so a date never shifts with the visitor's time zone. Hijri dates use the Umm al-Qura
 * calendar (the official Saudi calendar) through the built-in Intl API.
 */
import { nightsBetween } from "../booking";
import type { SiteLanguage } from "./schema";

export type ISODate = string;
export type DateRange = { start: ISODate | null; end: ISODate | null };

const DAY_MS = 86_400_000;
const toDate = (iso: ISODate) => new Date(`${iso}T00:00:00Z`);
export const toISO = (d: Date): ISODate => d.toISOString().slice(0, 10);
export const addDays = (iso: ISODate, n: number): ISODate => toISO(new Date(toDate(iso).getTime() + n * DAY_MS));
export const isISODate = (v: unknown): v is ISODate => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));

/** Saudi week: Sunday first. */
export const WEEK_STARTS_ON = 0;

/** The month containing `iso`, as weeks of 7 cells; days outside the month are null. */
export function monthGrid(year: number, month: number, weekStartsOn = WEEK_STARTS_ON): (ISODate | null)[][] {
  const first = new Date(Date.UTC(year, month, 1));
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const lead = (first.getUTCDay() - weekStartsOn + 7) % 7;
  const cells: (ISODate | null)[] = Array.from({ length: lead }, () => null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(toISO(new Date(Date.UTC(year, month, d))));
  while (cells.length % 7) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7));
}

/** Same day of the month, n months later (clamped to the month's last day). */
export function shiftMonths(iso: ISODate, n: number): ISODate {
  const d = toDate(iso);
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));
  const last = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(d.getUTCDate(), last));
  return toISO(target);
}

export const monthOf = (iso: ISODate) => ({ year: toDate(iso).getUTCFullYear(), month: toDate(iso).getUTCMonth() });
export function addMonths(year: number, month: number, n: number) {
  const d = new Date(Date.UTC(year, month + n, 1));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() };
}

// Western digits in both languages (as on the rest of the site).
const GREG = { en: "en-GB", ar: "ar-SA-u-ca-gregory-nu-latn" } as const;
const HIJRI = { en: "en-GB-u-ca-islamic-umalqura", ar: "ar-SA-u-ca-islamic-umalqura-nu-latn" } as const;

/** Formats with Intl; returns "" if this runtime lacks the calendar (never throws). */
function fmt(locale: string, iso: ISODate, options: Intl.DateTimeFormatOptions): string {
  try {
    return new Intl.DateTimeFormat(locale, { timeZone: "UTC", ...options }).format(toDate(iso));
  } catch {
    return "";
  }
}

export const gregorianMonthLabel = (year: number, month: number, lang: SiteLanguage) =>
  fmt(GREG[lang], toISO(new Date(Date.UTC(year, month, 1))), { month: "long", year: "numeric" });

export const shortDate = (iso: ISODate, lang: SiteLanguage) => fmt(GREG[lang], iso, { day: "numeric", month: "short" });
export const longDate = (iso: ISODate, lang: SiteLanguage) => fmt(GREG[lang], iso, { weekday: "long", day: "numeric", month: "long", year: "numeric" });

/** Hijri day of month, for the small number under each day. */
export const hijriDay = (iso: ISODate, lang: SiteLanguage) => fmt(HIJRI[lang], iso, { day: "numeric" });

/** Full Hijri date, for example "19 Jumada II 1448 AH". */
export const hijriDate = (iso: ISODate, lang: SiteLanguage) => fmt(HIJRI[lang], iso, { day: "numeric", month: "long", year: "numeric" });

/** The Hijri months a Gregorian month spans, for example "Jumada II – Rajab 1448 AH". */
export function hijriMonthSpan(year: number, month: number, lang: SiteLanguage): string {
  const first = toISO(new Date(Date.UTC(year, month, 1)));
  const last = toISO(new Date(Date.UTC(year, month + 1, 0)));
  const a = fmt(HIJRI[lang], first, { month: "long" });
  const b = fmt(HIJRI[lang], last, { month: "long", year: "numeric" });
  if (!a || !b) return "";
  return b.startsWith(a) ? b : `${a} – ${b}`;
}

/** Weekday names in grid order. */
export function weekdayNames(lang: SiteLanguage, weekStartsOn = WEEK_STARTS_ON): string[] {
  // 2023-01-01 was a Sunday.
  return Array.from({ length: 7 }, (_, i) => fmt(GREG[lang], addDays("2023-01-01", (weekStartsOn + i) % 7), { weekday: "short" }));
}

export type RangeRules = { today: ISODate; maxNights: number };

/** Days that cannot be picked: the past, and (while choosing check-out) nights beyond the limit. */
export function isDisabled(day: ISODate, range: DateRange, rules: RangeRules): boolean {
  if (day < rules.today) return true;
  if (range.start && !range.end && day > range.start) return nightsBetween(range.start, day) > rules.maxNights;
  return false;
}

/** What a click on `day` does: first click is check-in, second is check-out. */
export function selectDay(range: DateRange, day: ISODate, rules: RangeRules): DateRange {
  if (isDisabled(day, range, rules)) return range;
  if (!range.start || range.end || day <= range.start) return { start: day, end: null };
  return { start: range.start, end: day };
}

export const rangeNights = (r: DateRange) => (r.start && r.end ? nightsBetween(r.start, r.end) : 0);
