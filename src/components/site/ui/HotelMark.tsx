/**
 * A small mark for the hotel's assistant and buttons: an arch with an eight-point star.
 * Used until a hotel provides its own logo. Decorative unless `label` is given.
 */
export function HotelMark({ className = "size-6", label }: { className?: string; label?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} focusable="false">
      <path d="M7 28V15a9 9 0 0 1 18 0v13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12.5 15.5h7v7h-7z M16 13.5l4.9 4.5-4.9 4.5-4.9-4.5z" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}
