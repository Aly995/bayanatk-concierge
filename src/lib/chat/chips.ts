/**
 * Tappable suggestion chips for the guest chat.
 *
 * - Starter chips show before the first message, one per common guest language, to say
 *   "ask in any language" without words.
 * - Follow-up chips show after an answer from the assistant or the front desk, in the
 *   guest's own language. They never show while the assistant is waiting for an answer
 *   (its last message ends with a question mark), so they do not get in the guest's way.
 *
 * Every chip carries its language so the page can set `lang` on it (Urdu chips then use
 * the Nastaliq font). A test checks that each chip's text is detected as its language.
 */
import { detectLanguage } from "@/lib/i18n";
import type { LanguageCode, Message } from "@/lib/types";

export type ChipLanguage = Exclude<LanguageCode, "other">;
export type Chip = { text: string; lang: ChipLanguage };

export const STARTER_CHIPS: Chip[] = [
  { text: "What time is check-in?", lang: "en" },
  { text: "كم تبعد المسافة إلى الحرم؟", lang: "ar" },
  { text: "Saya butuh handuk tambahan", lang: "id" },
  { text: "مجھے کل صبح ایئرپورٹ کے لیے ٹیکسی چاہیے", lang: "ur" },
  { text: "Kahvaltı saat kaçta?", lang: "tr" },
];

/** Common next questions, per language. Add a language here and in `LanguageCode`. */
export const FOLLOW_UPS: Record<ChipLanguage, string[]> = {
  en: ["Is there an airport pickup?", "What time is breakfast?", "Can I talk to the front desk?"],
  ar: ["هل يوجد توصيل من المطار؟", "متى يبدأ الإفطار؟", "أريد التحدث مع الاستقبال"],
  ur: ["کیا ایئرپورٹ سے پک اپ ملتا ہے؟", "ناشتہ کس وقت ہوتا ہے؟", "ریسپشن سے بات کروائیں"],
  id: ["Apa ada jemputan dari bandara?", "Jam berapa sarapan?", "Saya mau bicara dengan resepsionis"],
  tr: ["Havalimanı transferi var mı?", "Kahvaltı saat kaçta?", "Resepsiyonla görüşmek istiyorum"],
};

const ENDS_WITH_QUESTION = /[?؟]\s*$/;
const normalise = (text: string) => text.trim().toLowerCase();

/** The language to suggest in: the guest's latest message, or English before they write. */
export function chipLanguage(messages: Message[]): ChipLanguage {
  const lastGuest = [...messages].reverse().find((m) => m.role === "guest");
  const detected = lastGuest ? detectLanguage(lastGuest.content) : "en";
  return detected === "other" ? "en" : detected;
}

/** Follow-up chips to show under the latest message, or none. */
export function followUpChips(messages: Message[], max = 3): Chip[] {
  const last = messages.at(-1);
  if (!last || last.role === "guest") return [];
  if (ENDS_WITH_QUESTION.test(last.content)) return [];
  const lang = chipLanguage(messages);
  const asked = new Set(messages.filter((m) => m.role === "guest").map((m) => normalise(m.content)));
  return FOLLOW_UPS[lang]
    .filter((text) => !asked.has(normalise(text)))
    .slice(0, max)
    .map((text) => ({ text, lang }));
}
