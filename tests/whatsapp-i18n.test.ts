import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { parseInboundTexts, verifySignature } from "@/lib/channels/whatsapp";
import { detectLanguage } from "@/lib/i18n";
import { extractRoomNumber } from "@/lib/ai/mock";

describe("WhatsApp webhook", () => {
  const secret = "test-app-secret";
  const body = JSON.stringify({ hello: "عالم" });
  const sign = (b: string) => "sha256=" + createHmac("sha256", secret).update(b, "utf8").digest("hex");

  it("accepts a correct signature", () => {
    expect(verifySignature(body, sign(body), secret)).toBe(true);
  });

  it("rejects a wrong, missing or tampered signature", () => {
    expect(verifySignature(body, sign(body + "x"), secret)).toBe(false);
    expect(verifySignature(body, null, secret)).toBe(false);
    expect(verifySignature(body, "sha256=abc", secret)).toBe(false);
  });

  it("extracts text messages and ignores status updates", () => {
    const payload = {
      entry: [{
        changes: [{
          value: {
            contacts: [{ wa_id: "966500000000", profile: { name: "Ahmad" } }],
            messages: [
              { id: "wamid.1", from: "966500000000", timestamp: "1700000000", type: "text", text: { body: "السلام عليكم" } },
              { id: "wamid.2", from: "966500000000", timestamp: "1700000001", type: "image", image: {} },
            ],
            statuses: [{ id: "wamid.0", status: "read" }],
          },
        }],
      }],
    };
    expect(parseInboundTexts(payload)).toEqual([
      { messageId: "wamid.1", from: "966500000000", name: "Ahmad", text: "السلام عليكم", timestamp: 1700000000 },
    ]);
    expect(parseInboundTexts({})).toEqual([]);
  });
});

describe("language detection", () => {
  it.each([
    ["كم تبعد المسافة إلى الحرم؟", "ar"],
    ["مجھے کل صبح ایئرپورٹ کے لیے ٹیکسی چاہیے", "ur"],
    ["Saya butuh handuk tambahan", "id"],
    ["Kahvaltı saat kaçta?", "tr"],
    ["What time is check-in?", "en"],
  ])("%s -> %s", (text, lang) => {
    expect(detectLanguage(text)).toBe(lang);
  });

  it("reads room numbers in Arabic digits", () => {
    expect(extractRoomNumber("غرفتي ٤١٢")).toBe("412");
  });
});
