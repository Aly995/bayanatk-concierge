import type { CSSProperties } from "react";
import type { HotelSite } from "./schema";

/**
 * The hotel's colours as CSS variables. Set them on any wrapper (the website's <body>, the
 * guest chat page) and every `hotel-*` colour class inside follows the hotel. Without a
 * brand, the defaults in globals.css apply.
 */
export function brandStyle(brand: HotelSite["brand"] | undefined): CSSProperties | undefined {
  if (!brand) return undefined;
  return {
    "--hotel-surface": brand.surface,
    "--hotel-primary": brand.primary,
    "--hotel-accent": brand.accent,
    "--hotel-ink": brand.ink,
  } as CSSProperties;
}
