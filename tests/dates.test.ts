import { describe, expect, it } from "vitest";
import {
  addDays,
  hijriDate,
  hijriDay,
  hijriMonthSpan,
  isDisabled,
  monthGrid,
  rangeNights,
  selectDay,
  shiftMonths,
  weekdayNames,
} from "@/lib/site/dates";

const rules = { today: "2026-12-01", maxNights: 30 };

describe("calendar grid", () => {
  it("starts weeks on Sunday and pads with empty cells", () => {
    const grid = monthGrid(2026, 11); // December 2026 starts on a Tuesday
    expect(grid[0]).toEqual([null, null, "2026-12-01", "2026-12-02", "2026-12-03", "2026-12-04", "2026-12-05"]);
    expect(grid.flat().filter(Boolean)).toHaveLength(31);
    expect(grid.every((w) => w.length === 7)).toBe(true);
  });

  it("names weekdays in both languages", () => {
    expect(weekdayNames("en")[0]).toBe("Sun");
    expect(weekdayNames("ar")[0]).toContain("الأحد");
  });

  it("adds days across month and year ends, and moves by month keeping the day", () => {
    expect(addDays("2026-12-30", 3)).toBe("2027-01-02");
    expect(shiftMonths("2027-01-31", 1)).toBe("2027-02-28");
    expect(shiftMonths("2027-01-15", -1)).toBe("2026-12-15");
  });
});

describe("Hijri dates (Umm al-Qura)", () => {
  it("gives the Hijri date in English and Arabic with Western digits", () => {
    // 1 Ramadan 1447 AH is 18 February 2026 in the Umm al-Qura calendar.
    expect(hijriDate("2026-02-18", "en")).toMatch(/1 Ramadan 1447/);
    expect(hijriDay("2026-02-18", "ar")).toBe("1");
    expect(hijriDate("2026-02-18", "ar")).toContain("رمضان");
  });

  it("shows the Hijri months a Gregorian month spans", () => {
    expect(hijriMonthSpan(2026, 1, "en")).toMatch(/Shaʻban|Sha.ban/);
    expect(hijriMonthSpan(2026, 1, "en")).toMatch(/Ramadan 1447/);
  });
});

describe("range selection", () => {
  it("picks check-in, then check-out, and counts nights", () => {
    let r = selectDay({ start: null, end: null }, "2026-12-20", rules);
    expect(r).toEqual({ start: "2026-12-20", end: null });
    r = selectDay(r, "2026-12-23", rules);
    expect(r).toEqual({ start: "2026-12-20", end: "2026-12-23" });
    expect(rangeNights(r)).toBe(3);
  });

  it("starts again when the second click is on or before check-in, or after a full range", () => {
    expect(selectDay({ start: "2026-12-20", end: null }, "2026-12-18", rules)).toEqual({ start: "2026-12-18", end: null });
    expect(selectDay({ start: "2026-12-20", end: "2026-12-23" }, "2026-12-25", rules)).toEqual({ start: "2026-12-25", end: null });
  });

  it("blocks past days and stays longer than the limit", () => {
    expect(isDisabled("2026-11-30", { start: null, end: null }, rules)).toBe(true);
    expect(isDisabled("2027-01-19", { start: "2026-12-20", end: null }, rules)).toBe(false); // 30 nights: allowed
    expect(isDisabled("2027-01-20", { start: "2026-12-20", end: null }, rules)).toBe(true); // 31 nights
    expect(selectDay({ start: null, end: null }, "2026-11-30", rules)).toEqual({ start: null, end: null });
  });
});
