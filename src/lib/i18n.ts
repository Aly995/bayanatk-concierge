import type { LanguageCode } from "./types";

/** Letters used in Urdu but not in standard Arabic. */
const URDU_ONLY = /[ٹڈڑںےۓھگچپ]/;
const ARABIC_SCRIPT = /[؀-ۿ]/;
const TURKISH_CHARS = /[ğışİĞŞ]/;
const INDONESIAN_WORDS =
  /\b(apa|jam|berapa|kamar|saya|terima kasih|tolong|bisa|mau|di mana|kapan|handuk)\b/i;
const TURKISH_WORDS = /\b(merhaba|teşekkür|oda|nerede|saat|lütfen|var mı)\b/i;

/**
 * Cheap, dependency-free language guess used for badges, routing and the
 * offline demo AI. The real AI model detects language itself.
 */
export function detectLanguage(text: string): LanguageCode {
  if (ARABIC_SCRIPT.test(text)) return URDU_ONLY.test(text) ? "ur" : "ar";
  if (TURKISH_CHARS.test(text) || TURKISH_WORDS.test(text)) return "tr";
  if (INDONESIAN_WORDS.test(text)) return "id";
  if (/[a-z]/i.test(text)) return "en";
  return "other";
}

export const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  ar: "العربية",
  en: "English",
  ur: "اردو",
  id: "Indonesia",
  tr: "Türkçe",
  other: "Other",
};

export function isRtl(lang: LanguageCode): boolean {
  return lang === "ar" || lang === "ur";
}
