/**
 * Drawn illustrations for hotel websites (no photos needed, no licensing).
 * Colours come from the hotel's brand variables, so every hotel's art matches its site.
 * All art is decorative: aria-hidden, with the facts given in text next to it.
 */
import type { AMENITY_ICONS, Room } from "@/lib/site/schema";

const P = "var(--hotel-primary)";
const A = "var(--hotel-accent)";
const INK = "var(--hotel-ink)";

/** Hero: the walk from the hotel door to the mosque gate. The route draws itself once on load. */
export function WalkRoute({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 560 340" className={className} aria-hidden="true" focusable="false">
      <defs>
        <mask id="route-reveal">
          <path className="route-draw" d="M96 300 C 170 336, 250 330, 300 312 S 392 296, 438 296" fill="none" stroke="#fff" strokeWidth="14" />
        </mask>
      </defs>
      {/* ground */}
      <path d="M0 300 H560" stroke={INK} strokeOpacity=".15" strokeWidth="2" />
      {/* hotel */}
      <rect x="34" y="128" width="124" height="172" rx="4" fill={INK} fillOpacity=".9" />
      <rect x="34" y="118" width="124" height="14" rx="3" fill={A} />
      {[0, 1, 2, 3].map((row) =>
        [0, 1, 2].map((col) => (
          <path
            key={`${row}-${col}`}
            d={`M${50 + col * 34} ${162 + row * 30} v-8 a11 8 0 0 1 22 0 v8 Z`}
            fill="#fff"
            fillOpacity={row === 1 && col === 1 ? 0.95 : 0.35}
          />
        )),
      )}
      <path d="M84 300 V272 a12 12 0 0 1 24 0 V300 Z" fill={A} />
      {/* plaza umbrellas */}
      {[214, 262].map((x) => (
        <g key={x}>
          <path d={`M${x - 26} 236 Q ${x} 252 ${x + 26} 236 L ${x} 224 Z`} fill="#fff" stroke={INK} strokeOpacity=".25" strokeWidth="1.5" />
          <path d={`M${x} 236 V300`} stroke={INK} strokeOpacity=".3" strokeWidth="2" />
        </g>
      ))}
      {/* mosque: wall with arches, dome, two minarets */}
      <rect x="350" y="62" width="14" height="238" fill={P} fillOpacity=".85" />
      <path d="M346 62 L357 30 L368 62 Z" fill={P} />
      <rect x="520" y="62" width="14" height="238" fill={P} fillOpacity=".85" />
      <path d="M516 62 L527 30 L538 62 Z" fill={P} />
      <rect x="364" y="214" width="156" height="86" fill="#fff" stroke={P} strokeWidth="2" />
      <path d="M396 214 a46 46 0 0 1 92 0 Z" fill={P} />
      <rect x="440" y="150" width="4" height="22" fill={A} />
      {[380, 412, 476].map((x) => (
        <path key={x} d={`M${x} 300 V262 a12 12 0 0 1 24 0 V300`} fill={P} fillOpacity=".18" />
      ))}
      <path d="M428 300 V258 a14 14 0 0 1 28 0 V300 Z" fill={A} />
      {/* the route */}
      <path d="M96 300 C 170 336, 250 330, 300 312 S 392 296, 438 296" fill="none" stroke={P} strokeWidth="4" strokeDasharray="2 10" strokeLinecap="round" mask="url(#route-reveal)" />
      <circle className="route-end" cx="442" cy="296" r="7" fill={A} stroke="#fff" strokeWidth="3" />
      <circle cx="96" cy="300" r="5" fill={P} />
    </svg>
  );
}

/** What you see from the room's window, drawn inside an arch. */
export function RoomView({ view, className = "" }: { view: Room["view"]; className?: string }) {
  return (
    <svg viewBox="0 0 200 240" className={className} aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid slice">
      <rect width="200" height="240" fill={P} fillOpacity=".08" />
      {view === "haram" && (
        <g>
          <circle cx="150" cy="70" r="16" fill={A} fillOpacity=".55" />
          <rect x="38" y="70" width="10" height="150" fill={P} fillOpacity=".75" />
          <path d="M35 70 L43 44 L51 70 Z" fill={P} fillOpacity=".75" />
          <rect x="152" y="96" width="10" height="124" fill={P} fillOpacity=".75" />
          <path d="M149 96 L157 72 L165 96 Z" fill={P} fillOpacity=".75" />
          <path d="M64 180 a36 36 0 0 1 72 0 Z" fill={P} />
          <rect x="48" y="180" width="104" height="60" fill={P} fillOpacity=".4" />
        </g>
      )}
      {view === "city" && (
        <g fill={INK}>
          <rect x="14" y="120" width="40" height="120" fillOpacity=".25" />
          <rect x="60" y="92" width="34" height="148" fillOpacity=".4" />
          <rect x="100" y="132" width="46" height="108" fillOpacity=".3" />
          <rect x="150" y="104" width="38" height="136" fillOpacity=".45" />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={68 + (i % 2) * 14} y={104 + i * 22} width="8" height="10" fill="#fff" fillOpacity=".6" />
          ))}
          <circle cx="40" cy="60" r="14" fill={A} fillOpacity=".5" />
        </g>
      )}
      {view === "courtyard" && (
        <g>
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M${18 + i * 58} 240 V170 a24 24 0 0 1 48 0 V240`} fill="none" stroke={P} strokeOpacity=".5" strokeWidth="6" />
          ))}
          <path d="M100 236 V120" stroke={INK} strokeOpacity=".5" strokeWidth="6" />
          {[-60, -25, 15, 55].map((angle) => (
            <path key={angle} d="M100 122 q 30 -6 52 14" fill="none" stroke={P} strokeWidth="7" strokeLinecap="round" transform={`rotate(${angle} 100 122)`} />
          ))}
        </g>
      )}
      {/* curtains */}
      <path d="M0 0 H34 Q 22 120 30 240 H0 Z" fill={A} fillOpacity=".35" />
      <path d="M200 0 H166 Q 178 120 170 240 H200 Z" fill={A} fillOpacity=".35" />
    </svg>
  );
}

type IconName = (typeof AMENITY_ICONS)[number];

const ICON_PATHS: Record<IconName, string> = {
  wifi: "M3 9.5a13 13 0 0 1 18 0M6 13a8.5 8.5 0 0 1 12 0M9 16.5a4 4 0 0 1 6 0M12 20h.01",
  breakfast: "M4 10h12v4a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM16 11h1.5a2.5 2.5 0 0 1 0 5H16M8 3v4M12 3v4",
  prayer: "M6 21V11a6 6 0 0 1 12 0v10M4 21h16M12 5V2M9.5 21v-4a2.5 2.5 0 0 1 5 0v4",
  zamzam: "M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11zM9.5 15a2.5 2.5 0 0 0 2.5 2.5",
  laundry: "M8 3 4 6l2 4 2-1v12h8V9l2 1 2-4-4-3a4 4 0 0 1-8 0z",
  shuttle: "M3 16V9a2 2 0 0 1 2-2h11l4 5v4M3 16h18M7 19.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM17 19.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM3 12h17",
  family: "M8 7a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM17 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM3 21v-6a5 5 0 0 1 10 0v6M13 21v-4a4 4 0 0 1 8 0v4",
  accessible: "M12 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM11 8v6h5l2 5M11 11h5M8.5 11.5a5 5 0 1 0 6.8 6.8",
  concierge: "M4 18h16M5 18a7 7 0 0 1 14 0M12 8V6M10 6h4M2 21h20",
  parking: "M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM10 17V7h3a3 3 0 0 1 0 6h-3",
};

export function AmenityIcon({ name, className = "size-6" }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}

export function CheckIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M4 10.5 8 14.5 16 6" />
    </svg>
  );
}
