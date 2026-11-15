import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * WhatsApp Cloud API helpers. Pure functions where possible so they are easy to test.
 * Docs: Meta for Developers > WhatsApp > Cloud API > Webhooks.
 */

const GRAPH_VERSION = "v21.0";

/** Checks Meta's X-Hub-Signature-256 header against the RAW request body. */
export function verifySignature(rawBody: string, signatureHeader: string | null, appSecret: string): boolean {
  if (!signatureHeader?.startsWith("sha256=")) return false;
  const expected = createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex");
  const received = signatureHeader.slice("sha256=".length);
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(received, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

export interface InboundText {
  messageId: string;
  from: string;
  name: string | null;
  text: string;
  timestamp: number;
}

/** Pulls plain text messages out of a webhook payload; ignores statuses and media. */
export function parseInboundTexts(payload: unknown): InboundText[] {
  const out: InboundText[] = [];
  const entries = (payload as { entry?: unknown[] })?.entry ?? [];
  for (const entry of entries as { changes?: { value?: Record<string, unknown> }[] }[]) {
    for (const change of entry.changes ?? []) {
      const value = change.value ?? {};
      const contacts = (value.contacts as { wa_id: string; profile?: { name?: string } }[] | undefined) ?? [];
      const messages = (value.messages as Record<string, any>[] | undefined) ?? []; // eslint-disable-line @typescript-eslint/no-explicit-any
      for (const m of messages) {
        if (m.type !== "text" || typeof m.text?.body !== "string") continue;
        const contact = contacts.find((c) => c.wa_id === m.from);
        out.push({
          messageId: String(m.id),
          from: String(m.from),
          name: contact?.profile?.name ?? null,
          text: m.text.body,
          timestamp: Number(m.timestamp) || 0,
        });
      }
    }
  }
  return out;
}

/** Sends a text reply. Free-form replies are allowed within 24h of the guest's last message. */
export async function sendText(opts: {
  accessToken: string;
  phoneNumberId: string;
  to: string;
  body: string;
}): Promise<void> {
  const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${opts.phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${opts.accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: opts.to,
      type: "text",
      text: { body: opts.body.slice(0, 4096) },
    }),
  });
  if (!res.ok) throw new Error(`WhatsApp send failed: ${res.status} ${await res.text()}`);
}
