/**
 * The eight-point star (khatam) lattice found across Madinah's architecture, as a thin-line
 * SVG layer. Decoration only: place it inside a `relative` parent; it fills the parent.
 *
 *   <GeometricPattern />                                  brass lines, faint
 *   <GeometricPattern color="var(--color-hotel)" opacity={0.06} size={120} />
 */
export function GeometricPattern({
  color = "var(--color-hotel-accent)",
  opacity = 0.18,
  size = 72,
  strokeWidth = 1,
  className = "",
}: {
  /** Any CSS colour; use a token such as var(--color-hotel-accent). */
  color?: string;
  opacity?: number;
  /** Width of one repeating tile in px. */
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  // Deterministic id from the options: identical patterns share one definition safely.
  const id = `khatam-${size}-${strokeWidth}-${color.replace(/[^a-z0-9]/gi, "")}`;
  const c = size / 2;
  const r = size * 0.3; // star radius
  const a = r / Math.SQRT2; // half-side of the axis-aligned square
  const star = [
    `M${c - a} ${c - a}H${c + a}V${c + a}H${c - a}Z`, // square
    `M${c} ${c - r}L${c + r} ${c}L${c} ${c + r}L${c - r} ${c}Z`, // square turned 45 degrees
    // lines that join each star to its neighbours across the tile edges
    `M${c} ${c - r}V0M${c} ${c + r}V${size}M${c - r} ${c}H0M${c + r} ${c}H${size}`,
  ].join("");
  return (
    <svg aria-hidden="true" focusable="false" className={`pointer-events-none absolute inset-0 size-full ${className}`}>
      <defs>
        <pattern id={id} width={size} height={size} patternUnits="userSpaceOnUse">
          <path d={star} fill="none" stroke={color} strokeWidth={strokeWidth} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} opacity={opacity} />
    </svg>
  );
}

/** A single eight-point star, for dividers and small marks. */
export function StarMark({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={className}>
      <path d="M5.5 5.5h13v13h-13z" fill="currentColor" />
      <path d="M12 2.8 21.2 12 12 21.2 2.8 12z" fill="currentColor" />
      <circle cx="12" cy="12" r="2.6" fill="var(--color-hotel-surface)" />
    </svg>
  );
}
