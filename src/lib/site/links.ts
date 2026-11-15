/** Links that open the guest's own apps. No tracking parameters, no personal data in URLs we build. */

export const digitsOnly = (phone: string) => phone.replace(/\D/g, "");

/** WhatsApp chat with the hotel (or a guest), optionally with a first message typed in. */
export function whatsappHref(phone: string, text?: string): string {
  const base = `https://wa.me/${digitsOnly(phone)}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export const telHref = (phone: string) => `tel:+${digitsOnly(phone)}`;

export const mapsHref = (lat: number, lng: number) => `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
