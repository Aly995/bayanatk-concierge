import { describe, expect, it } from "vitest";
import { DEMO_HOTEL } from "@/data/demo-hotel";
import { DEMO_SITE } from "@/data/demo-site";
import {
  bookingInput,
  createBooking,
  estimateFromPrice,
  makeReference,
  nightsBetween,
  todayInSaudi,
  validateBooking,
  type BookingInput,
} from "@/lib/booking";
import { hotelSiteSchema } from "@/lib/site/schema";
import { MemoryStore } from "@/lib/store/memory";

const site = hotelSiteSchema.parse(DEMO_SITE);
const TODAY = "2026-12-01";
const base: BookingInput = {
  roomId: "haram-view-double",
  checkIn: "2026-12-10",
  checkOut: "2026-12-13",
  adults: 2,
  children: 0,
  isGroup: false,
  groupSize: null,
  guestName: "Ahmad Rahman",
  phone: "+62 812 3456 7890",
  email: null,
  country: "Indonesia",
  language: "en",
  specialRequests: "Near the lift please",
  consent: true,
};

describe("demo website content", () => {
  it("is valid against the site schema", () => {
    expect(hotelSiteSchema.safeParse(DEMO_SITE).success).toBe(true);
  });

  it("agrees with the AI assistant's facts", () => {
    const facts = DEMO_HOTEL.knowledge.map((k) => k.content).join(" ");
    expect(facts).toContain(`Check-in from ${site.policies.checkIn}`);
    expect(facts).toContain(`Check-out by ${site.policies.checkOut}`);
    expect(facts).toContain(`${site.location.walkMinutesToHaram} minutes' walk`);
    expect(facts).toContain(site.location.gate.en);
    // Book-direct perks shown on the website must also be known to the AI.
    expect(facts).toContain("free for guests who booked directly with the hotel for 3 nights or more");
    expect(facts).toContain("free late check-out until 14:00");
  });

  it("has unique room and offer ids", () => {
    const ids = site.rooms.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    const offerIds = site.offers.map((o) => o.id);
    expect(new Set(offerIds).size).toBe(offerIds.length);
  });

  it("rejects broken content instead of rendering it", () => {
    const broken = { ...DEMO_SITE, brand: { primary: "green", accent: "#c9a24b", ink: "#12211e" } };
    expect(hotelSiteSchema.safeParse(broken).success).toBe(false);
  });
});

describe("booking rules", () => {
  it("accepts a normal request", () => {
    expect(validateBooking(base, site, TODAY)).toBeNull();
    expect(nightsBetween(base.checkIn, base.checkOut)).toBe(3);
    expect(estimateFromPrice(site.rooms[0]!, base.checkIn, base.checkOut)).toBe(3 * 650);
  });

  it.each([
    [{ roomId: "penthouse" }, "unknown_room"],
    [{ checkOut: "2026-12-10" }, "dates_invalid"],
    [{ checkIn: "2026-11-20", checkOut: "2026-11-22" }, "check_in_in_past"],
    [{ checkOut: "2027-01-20" }, "too_many_nights"],
    [{ adults: 3 }, "too_many_guests"],
    [{ isGroup: true, groupSize: null }, "group_size_required"],
  ] as const)("%o -> %s", (patch, error) => {
    expect(validateBooking({ ...base, ...patch }, site, TODAY)).toBe(error);
  });

  it("lets groups exceed one room's size", () => {
    expect(validateBooking({ ...base, isGroup: true, groupSize: 40, adults: 12 }, site, TODAY)).toBeNull();
  });

  it("requires consent and a sensible phone number in the form", () => {
    expect(bookingInput.safeParse(base).success).toBe(true);
    expect(bookingInput.safeParse({ ...base, consent: false }).success).toBe(false);
    expect(bookingInput.safeParse({ ...base, phone: "call me" }).success).toBe(false);
  });

  it("makes readable, unambiguous reference codes", () => {
    for (let i = 0; i < 200; i++) expect(makeReference()).toMatch(/^BK-[A-HJ-NP-Z2-9]{6}$/);
  });

  it("uses the Saudi date for 'today'", () => {
    expect(todayInSaudi(new Date("2026-12-01T22:30:00Z"))).toBe("2026-12-02"); // 01:30 in Madinah
  });
});

describe("booking requests in the store", () => {
  it("saves a request and keeps hotels apart", async () => {
    const store = new MemoryStore();
    const result = await createBooking({ store, today: TODAY }, DEMO_HOTEL, site, base);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.booking.status).toBe("new");
    expect(await store.listBookingRequests(DEMO_HOTEL.id)).toHaveLength(1);
    expect(await store.listBookingRequests("other-hotel")).toHaveLength(0);
    expect(await store.updateBookingStatus("other-hotel", result.booking.id, "confirmed")).toBeNull();
    expect((await store.updateBookingStatus(DEMO_HOTEL.id, result.booking.id, "confirmed"))?.status).toBe("confirmed");
  });

  it("does not save an invalid request", async () => {
    const store = new MemoryStore();
    const result = await createBooking({ store, today: TODAY }, DEMO_HOTEL, site, { ...base, adults: 5 });
    expect(result).toEqual({ ok: false, error: "too_many_guests" });
    expect(await store.listBookingRequests(DEMO_HOTEL.id)).toHaveLength(0);
  });
});

describe("website helpers", () => {
  it("builds hotel structured data from the site content only", async () => {
    const { hotelJsonLd, jsonForScript, languageAlternates } = await import("@/lib/site/seo");
    const ld = hotelJsonLd(DEMO_HOTEL, site, "ar", "https://demo.bayanatk.com");
    expect(ld["@type"]).toBe("Hotel");
    expect(ld.name).toBe(DEMO_HOTEL.nameAr);
    expect(ld.checkinTime).toBe("15:00");
    expect(ld.priceRange).toBe("SAR 450–980");
    expect(ld.url).toBe("https://demo.bayanatk.com/site/demo-madinah/ar");
    expect(jsonForScript({ x: "</script><script>alert(1)</script>" })).not.toContain("</script>");
    expect(languageAlternates("demo-madinah", "en", "book").languages).toEqual({
      en: "/site/demo-madinah/en/book",
      ar: "/site/demo-madinah/ar/book",
      "x-default": "/site/demo-madinah/en/book",
    });
  });

  it("writes Arabic counts with the right noun form", async () => {
    const { arCount } = await import("@/lib/site/strings");
    const nights: [string, string, string, string] = ["ليلة واحدة", "ليلتان", "ليالٍ", "ليلة"];
    expect([1, 2, 3, 10, 11, 30].map((n) => arCount(n, nights))).toEqual([
      "ليلة واحدة", "ليلتان", "3 ليالٍ", "10 ليالٍ", "11 ليلة", "30 ليلة",
    ]);
  });

  it("makes WhatsApp links from any phone format", async () => {
    const { whatsappHref } = await import("@/lib/site/links");
    expect(whatsappHref("+966 50 000-0000")).toBe("https://wa.me/966500000000");
    expect(whatsappHref("+62 812", "Booking BK-ABC234")).toBe("https://wa.me/62812?text=Booking%20BK-ABC234");
  });

  it("states the configured retention in both languages of the privacy notice", async () => {
    const { privacySections } = await import("@/lib/privacy");
    const sections = privacySections({
      hotelName: { en: "Hotel", ar: "فندق" },
      contact: { email: "a@b.co" },
      retentionDays: 7,
      bookingRetentionDays: 365,
    });
    const retention = sections.find((x) => x.title.en === "How long we keep it")!.body[0]!;
    expect(retention.en).toContain("7 days");
    expect(retention.ar).toContain("7 أيام");
    expect(retention.ar).toContain("365 يوماً");
  });
});
