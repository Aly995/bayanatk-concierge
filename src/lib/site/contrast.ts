import type { HotelSite } from "./schema";

/** WCAG relative luminance of a #rrggbb colour. */
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5]
    .map((i) => Number.parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

/** WCAG contrast ratio between two #rrggbb colours (1 to 21). */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

/** Minimum for normal text (WCAG AA). */
export const MIN_TEXT_CONTRAST = 4.5;

/**
 * The colour pairs a hotel website actually uses for text (see references/design-system.md).
 * Returns one message per pair below the minimum; an empty list means the palette is fine.
 */
export function brandContrastProblems(brand: HotelSite["brand"]): string[] {
  const pairs: [string, string, string][] = [
    ["white text on the main colour", "#ffffff", brand.primary],
    ["ink text on the accent (buttons)", brand.ink, brand.accent],
    ["ink text on the surface", brand.ink, brand.surface],
    ["main colour headings on the surface", brand.primary, brand.surface],
  ];
  return pairs
    .map(([label, fg, bg]) => ({ label, ratio: contrastRatio(fg, bg) }))
    .filter((p) => p.ratio < MIN_TEXT_CONTRAST)
    .map((p) => `${p.label}: ${p.ratio.toFixed(2)}:1, needs ${MIN_TEXT_CONTRAST}:1`);
}
