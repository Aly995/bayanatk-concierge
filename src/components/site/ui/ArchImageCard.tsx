import type { Photo, SiteLanguage } from "@/lib/site/schema";
import { SitePhoto } from "../SitePhoto";
import { GeometricPattern } from "./GeometricPattern";

/**
 * An image in an arched frame (the gates and windows of Madinah), with the content below.
 * Shows the photo when there is one, otherwise the given drawing. On hover the image
 * lifts slightly and a brass star lattice appears inside the arch.
 */
export function ArchImageCard(props: {
  photo?: Photo;
  lang: SiteLanguage;
  fallback: React.ReactNode;
  sizes?: string;
  aspect?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`group flex h-full flex-col ${props.className ?? ""}`}>
      <div className={`relative overflow-hidden rounded-t-arch bg-hotel-paper ${props.aspect ?? "aspect-[4/5]"}`}>
        <div className="size-full transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.03]">
          <SitePhoto photo={props.photo} lang={props.lang} sizes={props.sizes} className="size-full" fallback={props.fallback} />
        </div>
        <div className="opacity-0 transition-opacity duration-500 motion-safe:group-hover:opacity-100">
          <GeometricPattern opacity={0.5} size={56} />
        </div>
        {/* Thin brass inner border follows the arch. */}
        <span aria-hidden="true" className="pointer-events-none absolute inset-2 rounded-t-arch border border-hotel-accent/50" />
      </div>
      {props.children}
    </div>
  );
}
