import { after } from "next/server";
import { getAIProvider } from "@/lib/ai";
import { handleGuestMessage } from "@/lib/assistant";
import { parseInboundTexts, sendText, verifySignature } from "@/lib/channels/whatsapp";
import { config } from "@/lib/config";
import { getStore } from "@/lib/store";

/** Meta's one-time webhook verification handshake. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const ok =
    config.whatsapp.verifyToken &&
    url.searchParams.get("hub.mode") === "subscribe" &&
    url.searchParams.get("hub.verify_token") === config.whatsapp.verifyToken;
  return ok
    ? new Response(url.searchParams.get("hub.challenge") ?? "", { status: 200 })
    : new Response("Forbidden", { status: 403 });
}

/**
 * Incoming WhatsApp messages. Best practice: check the signature on the raw
 * body, answer 200 fast, then do the slow AI work after the response is sent.
 */
export async function POST(req: Request) {
  if (!config.whatsapp.enabled) return new Response("WhatsApp not configured", { status: 503 });

  const raw = await req.text();
  if (!verifySignature(raw, req.headers.get("x-hub-signature-256"), config.whatsapp.appSecret!)) {
    return new Response("Invalid signature", { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }
  const inbound = parseInboundTexts(payload);

  after(async () => {
    const store = getStore();
    const hotel = await store.getHotelBySlug(config.whatsapp.hotelSlug);
    if (!hotel) return console.error(`WhatsApp hotel '${config.whatsapp.hotelSlug}' not found`);
    for (const msg of inbound.sort((a, b) => a.timestamp - b.timestamp)) {
      // Meta delivers at least once: skip duplicates.
      if (!(await store.claimExternalMessage(msg.messageId))) continue;
      try {
        const { reply } = await handleGuestMessage(
          { store, ai: getAIProvider() },
          { hotel, channel: "whatsapp", externalId: msg.from, text: msg.text },
        );
        if (reply) {
          await sendText({
            accessToken: config.whatsapp.accessToken!,
            phoneNumberId: config.whatsapp.phoneNumberId!,
            to: msg.from,
            body: reply.content,
          });
        }
      } catch (err) {
        console.error("WhatsApp message failed", msg.messageId, err);
      }
    }
  });

  return new Response("OK", { status: 200 });
}
