import type { Photo, SiteLanguage } from "@/lib/site/schema";
import { imageSources } from "@/lib/site/images";

/**
 * A hotel photo, or the drawn fallback when the hotel has not added one yet.
 * Plain <img> with srcset: works on Cloudflare Workers without an image service.
 * `sizes` tells the browser how wide the image shows, so phones download the small file.
 */
export function SitePhoto(props: {
  photo?: Photo;
  lang: SiteLanguage;
  fallback: React.ReactNode;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (!props.photo) return <>{props.fallback}</>;
  const { src, srcSet } = imageSources(props.photo.src);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      srcSet={srcSet}
      sizes={srcSet ? (props.sizes ?? "100vw") : undefined}
      alt={props.photo.alt[props.lang]}
      className={`object-cover ${props.className ?? ""}`}
      loading={props.priority ? "eager" : "lazy"}
      fetchPriority={props.priority ? "high" : undefined}
      decoding="async"
    />
  );
}
