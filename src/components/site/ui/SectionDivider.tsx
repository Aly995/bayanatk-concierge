import { StarMark } from "./GeometricPattern";

/** A thin brass rule with an eight-point star in the middle. Decorative. */
export function SectionDivider({ className = "", width = "w-40" }: { className?: string; width?: string }) {
  return (
    <div aria-hidden="true" className={`flex items-center gap-3 text-hotel-accent ${width} ${className}`}>
      <span className="h-px flex-1 bg-current opacity-60" />
      <StarMark className="size-4 shrink-0" />
      <span className="h-px flex-1 bg-current opacity-60" />
    </div>
  );
}
