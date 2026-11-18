import { Icon } from "./Icon";

/** A native select (keeps keyboard and screen reader support) styled to match the date picker. */
export function SelectField(props: { label: string; name: string; min: number; max: number; defaultValue: number }) {
  const options = Array.from({ length: props.max - props.min + 1 }, (_, i) => props.min + i);
  return (
    <label className="block text-xs font-semibold text-hotel-ink/65">
      {props.label}
      <span className="relative mt-1 block">
        <select
          name={props.name}
          defaultValue={String(props.defaultValue)}
          className="block w-full appearance-none rounded-control border border-hotel-ink/20 bg-hotel-paper py-3 pe-9 ps-3 text-[16px] font-semibold text-hotel-ink hover:border-hotel/60"
        >
          {options.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <Icon name="chevron-down" className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-hotel" />
      </span>
    </label>
  );
}
