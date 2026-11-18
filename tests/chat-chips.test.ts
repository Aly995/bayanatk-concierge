import { describe, expect, it } from "vitest";
import { FOLLOW_UPS, STARTER_CHIPS, chipLanguage, followUpChips } from "@/lib/chat/chips";
import { detectLanguage } from "@/lib/i18n";
import type { Message } from "@/lib/types";

const msg = (role: Message["role"], content: string, i = 0): Message => ({
  id: `m${i}-${role}`,
  conversationId: "c1",
  role,
  content,
  createdAt: "2026-11-18T10:00:00.000Z",
});

describe("guest chat chips", () => {
  it("labels every chip with the language its text is written in", () => {
    for (const chip of STARTER_CHIPS) expect(detectLanguage(chip.text), chip.text).toBe(chip.lang);
    for (const [lang, texts] of Object.entries(FOLLOW_UPS)) {
      for (const text of texts) expect(detectLanguage(text), text).toBe(lang);
    }
  });

  it("offers no follow-ups before an answer arrives", () => {
    expect(followUpChips([])).toEqual([]);
    expect(followUpChips([msg("guest", "Hello")])).toEqual([]);
  });

  it("offers follow-ups in the guest's language after an answer", () => {
    const chips = followUpChips([msg("guest", "متى موعد تسجيل الدخول؟"), msg("assistant", "تسجيل الدخول من الساعة 3 عصراً.")]);
    expect(chips.length).toBeGreaterThan(0);
    expect(chips.every((c) => c.lang === "ar")).toBe(true);

    const urdu = followUpChips([msg("guest", "مجھے تولیہ چاہیے"), msg("assistant", "ٹھیک ہے، بھیج رہے ہیں۔")]);
    expect(urdu.every((c) => c.lang === "ur")).toBe(true);
  });

  it("stays quiet while the assistant waits for the guest to answer a question", () => {
    expect(followUpChips([msg("guest", "I need a taxi"), msg("assistant", "Sure. What time?")])).toEqual([]);
    expect(followUpChips([msg("guest", "أريد سيارة"), msg("assistant", "بكل سرور، متى تريدها؟")])).toEqual([]);
  });

  it("does not suggest a question the guest already asked", () => {
    const asked = "Is there an airport pickup?";
    expect(FOLLOW_UPS.en).toContain(asked);
    const chips = followUpChips([msg("guest", asked), msg("assistant", "Yes, SAR 120 per car.")]);
    expect(chips.map((c) => c.text)).not.toContain(asked);
  });

  it("falls back to English when the language is unknown", () => {
    expect(chipLanguage([msg("guest", "👍")])).toBe("en");
    expect(chipLanguage([])).toBe("en");
  });
});
