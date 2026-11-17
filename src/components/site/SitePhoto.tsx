import type { Photo, SiteLanguage } from "@/lib/site/schema";

/**
 * A hotel photo, or the drawn fallback when the hotel has not added one yet.
 * Plain <img>: works the same on Cloudflare Workers without an image service.
 */
export function SitePhoto(props: {
  photo?: Photo;
  lang: SiteLanguage;
  fallback: React.ReactNode;
  className?: string;
  priority?: boolean;
}) {
  if (!props.photo) return <>{props.fallback}</>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={props.photo.src}
      alt={props.photo.alt[props.lang]}
      className={`object-cover ${props.className ?? ""}`}
      loading={props.priority ? "eager" : "lazy"}
      decoding="async"
    />
  );
}
