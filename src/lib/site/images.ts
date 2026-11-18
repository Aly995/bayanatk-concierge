/**
 * Responsive image sources. Photos optimised into the app (`/images/<name>`) come in
 * three WebP widths made by `npm run images:optimize`; outside HTTPS photos are used as given.
 */
export const IMAGE_WIDTHS = [640, 1280, 1920] as const;

export const isLocalImage = (src: string) => src.startsWith("/images/");

export function imageSources(src: string): { src: string; srcSet?: string } {
  if (!isLocalImage(src)) return { src };
  return {
    src: `${src}-1280.webp`,
    srcSet: IMAGE_WIDTHS.map((w) => `${src}-${w}.webp ${w}w`).join(", "),
  };
}
