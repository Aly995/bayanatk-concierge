import { cache } from "react";
import { notFound } from "next/navigation";
import { getStore } from "../store";
import { SITE_LANGUAGES, type SiteLanguage } from "./schema";

export const isSiteLanguage = (v: string): v is SiteLanguage => (SITE_LANGUAGES as readonly string[]).includes(v);

/**
 * The hotel and its website content, or null.
 * `cache` makes the layout, page and metadata of one request share one database read.
 */
export const findSite = cache(async (slug: string) => {
  const store = getStore();
  const hotel = await store.getHotelBySlug(slug);
  if (!hotel) return null;
  const site = await store.getHotelSite(hotel.id);
  return site ? { hotel, site } : null;
});

/** Same, for pages: unknown hotel, hotel without a website, or unknown language -> 404. */
export async function loadSite(slug: string, lang: string) {
  if (!isSiteLanguage(lang)) notFound();
  const found = await findSite(slug);
  if (!found) notFound();
  return { ...found, lang };
}
