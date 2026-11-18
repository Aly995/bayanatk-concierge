import { siWhatsapp } from "simple-icons";

/**
 * WhatsApp's own glyph (from Simple Icons, CC0), used only to link to a WhatsApp chat,
 * as WhatsApp's brand guidelines allow. Decorative: the link text names WhatsApp.
 */
export function WhatsAppIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <path d={siWhatsapp.path} fill="currentColor" />
    </svg>
  );
}

/** WhatsApp's brand green, for the icon's background only. */
export const WHATSAPP_GREEN = `#${siWhatsapp.hex}`;
