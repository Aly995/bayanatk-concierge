/**
 * Line icons for hotel websites (Lucide, ISC licence). One name per meaning, so content
 * can say `icon: "breakfast"` without knowing the icon library.
 */
import {
  Accessibility,
  BedDouble,
  BellRing,
  CalendarDays,
  CarFront,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Coffee,
  DoorOpen,
  Droplet,
  Eye,
  Footprints,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plane,
  Ruler,
  SendHorizontal,
  Shirt,
  SquareParking,
  Star,
  Users,
  Wifi,
  X,
  type LucideIcon,
} from "lucide-react";
import type { AMENITY_ICONS } from "@/lib/site/schema";

const ICONS = {
  // Amenity and facility icons (names used in hotel content)
  wifi: Wifi,
  breakfast: Coffee,
  prayer: Star,
  zamzam: Droplet,
  laundry: Shirt,
  shuttle: CarFront,
  family: Users,
  accessible: Accessibility,
  concierge: BellRing,
  parking: SquareParking,
  // Interface icons
  walk: Footprints,
  gate: DoorOpen,
  plane: Plane,
  chat: MessageCircle,
  bed: BedDouble,
  size: Ruler,
  view: Eye,
  guests: Users,
  calendar: CalendarDays,
  pin: MapPin,
  phone: Phone,
  mail: Mail,
  globe: Globe,
  check: Check,
  close: X,
  send: SendHorizontal,
  "chevron-down": ChevronDown,
  "chevron-start": ChevronLeft,
  "chevron-end": ChevronRight,
} satisfies Record<(typeof AMENITY_ICONS)[number] | string, LucideIcon>;

export type IconName = keyof typeof ICONS;

/** Decorative by default (hidden from screen readers); pass `label` when the icon stands alone. */
export function Icon({ name, className = "size-5", label }: { name: IconName; className?: string; label?: string }) {
  const Svg = ICONS[name];
  // Start/end chevrons point the reading direction: flipped in Arabic.
  const flip = name === "chevron-start" || name === "chevron-end" ? " rtl:-scale-x-100" : "";
  return <Svg className={`${className}${flip}`} strokeWidth={1.6} aria-hidden={label ? undefined : true} aria-label={label} role={label ? "img" : undefined} />;
}
