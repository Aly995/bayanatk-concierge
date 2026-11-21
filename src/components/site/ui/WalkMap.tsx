/**
 * A stylised map of the walk from the hotel to its Haram gate: the hotel's strongest
 * selling point, made visual. It is a drawing, not a street map: the layout is the same
 * for every hotel, only the labels change. "Open in Google Maps" gives the real route.
 *
 * Maps are not mirrored in Arabic (north stays up), so this block is laid out left to
 * right with physical positions; the label text itself still follows the page language.
 */
import { Icon } from "./Icon";

export function WalkMap(props: {
  hotelName: string;
  gateLabel: string;
  minutesLabel: string;
  mosqueLabel: string;
  compact?: boolean;
  className?: string;
}) {
  const route = "M112 318 H196 Q206 318 206 308 V236 Q206 226 216 226 H352";
  const label = props.compact ? "text-[11px] px-2 py-0.5" : "text-sm px-3 py-1";
  return (
    <figure dir="ltr" className={`relative overflow-hidden rounded-card bg-hotel-paper ring-1 ring-hotel-ink/10 ${props.className ?? ""}`}>
      <svg viewBox="0 0 600 400" className="block h-auto w-full" aria-hidden="true" focusable="false">
        {/* city blocks between the streets */}
        <rect width="600" height="400" fill="var(--color-hotel-surface)" />
        {[
          [24, 24, 150, 170],
          [24, 214, 150, 80],
          [24, 338, 150, 50],
          [222, 24, 104, 170],
          [222, 250, 104, 138],
        ].map(([x, y, w, h]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} rx="10" fill="var(--color-hotel-ink)" opacity="0.05" />
        ))}
        {/* the Haram: courtyard, plaza and the green dome, seen from above */}
        <rect x="352" y="24" width="224" height="364" rx="18" fill="var(--color-hotel)" opacity="0.08" />
        <rect x="352" y="24" width="224" height="364" rx="18" fill="none" stroke="var(--color-hotel)" strokeOpacity="0.35" strokeWidth="1.5" />
        <rect x="388" y="70" width="152" height="200" rx="8" fill="var(--color-hotel-paper)" stroke="var(--color-hotel)" strokeOpacity="0.25" />
        <circle cx="464" cy="300" r="26" fill="var(--color-hotel)" />
        {[
          [372, 44],
          [556, 44],
          [372, 368],
          [556, 368],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="6" fill="var(--color-hotel)" opacity="0.7" />
        ))}
        {/* the walking route, drawn on scroll where supported */}
        <path d={route} fill="none" stroke="var(--color-hotel-accent)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" opacity="0.25" />
        <path className="walk-route" d={route} fill="none" stroke="var(--color-hotel)" strokeWidth="3.5" strokeDasharray="1 9" strokeLinecap="round" />
        {/* hotel and gate markers */}
        <circle cx="112" cy="318" r="11" fill="var(--color-hotel)" stroke="var(--color-hotel-paper)" strokeWidth="4" />
        <circle cx="352" cy="226" r="11" fill="var(--color-hotel-accent)" stroke="var(--color-hotel-paper)" strokeWidth="4" />
        {/* north arrow */}
        <path d="M44 360 l8 -22 l8 22 l-8 -6 z" fill="var(--color-hotel-ink)" opacity="0.5" />
      </svg>

      {/* Labels in HTML so they use the page's fonts and language. */}
      <span
        dir="auto"
        className={`absolute top-[79.5%] mt-3 whitespace-nowrap rounded-full bg-hotel text-hotel-on-primary shadow-card ${label} ${props.compact ? "left-[4%]" : "left-[18.7%] -translate-x-1/2"}`}
      >
        {props.hotelName}
      </span>
      <span dir="auto" className={`absolute left-[58.7%] top-[56.5%] -translate-x-1/2 -translate-y-[170%] whitespace-nowrap rounded-full bg-hotel-accent font-semibold text-hotel-ink shadow-card ${label}`}>
        {props.gateLabel}
      </span>
      <span dir="auto" className={`absolute left-[34.3%] top-[68%] flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-hotel-paper font-semibold text-hotel shadow-card ring-1 ring-hotel/20 ${label}`}>
        <Icon name="walk" className={props.compact ? "size-3.5" : "size-4"} />
        {props.minutesLabel}
      </span>
      {!props.compact && (
        <span dir="auto" className="absolute left-[77.3%] top-[18%] -translate-x-1/2 text-center font-display text-lg font-semibold text-hotel">
          {props.mosqueLabel}
        </span>
      )}
    </figure>
  );
}
