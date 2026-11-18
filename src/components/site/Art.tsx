/**
 * Drawn illustrations for hotel websites (no photos needed, no licensing).
 * Colours come from the hotel's brand variables, so every hotel's art matches its site.
 * All art is decorative: aria-hidden, with the facts given in text next to it.
 */
import type { Room } from "@/lib/site/schema";

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
