import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import type { z } from "zod";
import { config } from "./config";
import { FixedWindowLimiter } from "./ratelimit";
import { getStore } from "./store";
import type { Hotel } from "./types";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public headers: Record<string, string> = {},
  ) {
    super(message);
  }
}

const publicLimiter = new FixedWindowLimiter(config.limits.requestsPerMinute, 60_000);

/** The visitor's IP as Cloudflare (or another proxy) reports it. */
function clientKey(req: Request): string {
  return (
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

/** Public endpoints (guest chat, booking requests): limit requests per visitor per minute. */
export function enforceRateLimit(req: Request, scope: string): void {
  const result = publicLimiter.hit(`${scope}:${clientKey(req)}`);
  if (!result.ok) {
    throw new HttpError(429, "Too many requests. Please wait a moment and try again.", {
      "Retry-After": String(result.retryAfterSec),
    });
  }
}

export async function loadHotel(slug: string): Promise<Hotel> {
  const hotel = await getStore().getHotelBySlug(slug);
  if (!hotel) throw new HttpError(404, "Hotel not found");
  return hotel;
}

export async function parseBody<T extends z.ZodTypeAny>(req: Request, schema: T): Promise<z.infer<T>> {
  const json = await req.json().catch(() => null);
  const result = schema.safeParse(json);
  if (!result.success) throw new HttpError(400, "Invalid request body");
  return result.data;
}

/**
 * Staff endpoints: open in local demos, protected by STAFF_ACCESS_KEY when it is set.
 * The public demo hotel (fictional data) stays open so website visitors can try the inbox.
 */
export function requireStaff(req: Request, hotelSlug: string): void {
  const expected = config.staff.accessKey;
  if (!expected) return;
  if (config.staff.publicDemoSlug && hotelSlug === config.staff.publicDemoSlug) return;
  const given = new URL(req.url).searchParams.get("key") ?? req.headers.get("x-staff-key") ?? "";
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) throw new HttpError(401, "Staff access key required");
}

/** Wraps a route handler with consistent JSON errors. */
export function route<A extends unknown[]>(handler: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (err) {
      if (err instanceof HttpError) {
        return NextResponse.json({ error: err.message }, { status: err.status, headers: err.headers });
      }
      console.error(err);
      return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
  };
}
