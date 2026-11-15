export function Logo({ size = 20 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2 font-extrabold text-brand" style={{ fontSize: size }}>
      <svg width={size} height={size * 1.08} viewBox="0 0 26 28" aria-hidden="true">
        <path d="M4 3 L23 14 L4 25 Z" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinejoin="round" />
      </svg>
      Bayanatk
    </span>
  );
}
