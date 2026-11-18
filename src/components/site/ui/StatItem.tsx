import { Icon, type IconName } from "./Icon";

/** One key fact: icon, big value, short label. Used in the strip under the hero. */
export function StatItem({ icon, value, label }: { icon: IconName; value: string; label: string }) {
  return (
    <div className="flex items-center gap-4 px-5 py-5 sm:px-6">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-hotel/[0.07] text-hotel">
        <Icon name={icon} className="size-5" />
      </span>
      <dl className="flex min-w-0 flex-col-reverse">
        <dt className="text-sm text-hotel-ink/70">{label}</dt>
        <dd className="font-display text-2xl font-medium leading-tight text-hotel">{value}</dd>
      </dl>
    </div>
  );
}
