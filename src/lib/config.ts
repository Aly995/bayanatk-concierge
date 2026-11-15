import { z } from "zod";

/**
 * All environment configuration is read and validated here, once.
 * Every other module imports `config` instead of touching process.env.
 */
const optional = z
  .string()
  .optional()
  .transform((v) => (v && v.trim().length > 0 ? v.trim() : undefined));

/** A positive whole number from the environment, or the default when unset. */
const positiveInt = (fallback: number) =>
  z
    .string()
    .optional()
    .transform((v) => (v && v.trim() ? Number.parseInt(v, 10) : fallback))
    .pipe(z.number().int().positive());

const schema = z.object({
  ANTHROPIC_API_KEY: optional,
  ANTHROPIC_MODEL: optional,
  SUPABASE_URL: optional,
  SUPABASE_SERVICE_ROLE_KEY: optional,
  WHATSAPP_VERIFY_TOKEN: optional,
  WHATSAPP_APP_SECRET: optional,
  WHATSAPP_ACCESS_TOKEN: optional,
  WHATSAPP_PHONE_NUMBER_ID: optional,
  WHATSAPP_HOTEL_SLUG: optional,
  STAFF_ACCESS_KEY: optional,
  PUBLIC_DEMO_HOTEL_SLUG: optional,
  RATE_LIMIT_PER_MINUTE: positiveInt(20),
  MAX_GUEST_MESSAGES_PER_DAY: positiveInt(50),
  DATA_RETENTION_DAYS: positiveInt(90),
  BOOKING_RETENTION_DAYS: positiveInt(365),
  PUBLIC_BASE_URL: z.string().url().optional().default("http://localhost:3000"),
});

const env = schema.parse(process.env);

export const config = {
  ai: {
    apiKey: env.ANTHROPIC_API_KEY,
    model: env.ANTHROPIC_MODEL ?? "claude-sonnet-5-5",
    /** Offline rule-based replies when no API key is set. */
    useMock: !env.ANTHROPIC_API_KEY,
  },
  supabase: {
    url: env.SUPABASE_URL,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    enabled: Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY),
  },
  whatsapp: {
    verifyToken: env.WHATSAPP_VERIFY_TOKEN,
    appSecret: env.WHATSAPP_APP_SECRET,
    accessToken: env.WHATSAPP_ACCESS_TOKEN,
    phoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID,
    hotelSlug: env.WHATSAPP_HOTEL_SLUG ?? "demo-madinah",
    enabled: Boolean(
      env.WHATSAPP_VERIFY_TOKEN &&
        env.WHATSAPP_APP_SECRET &&
        env.WHATSAPP_ACCESS_TOKEN &&
        env.WHATSAPP_PHONE_NUMBER_ID,
    ),
  },
  staff: {
    /** Interim protection for the staff inbox until Supabase Auth is added (see docs/ROADMAP.md). */
    accessKey: env.STAFF_ACCESS_KEY,
    /** This hotel's inbox stays open to everyone (use only for the fictional demo hotel). */
    publicDemoSlug: env.PUBLIC_DEMO_HOTEL_SLUG,
  },
  limits: {
    /** Requests per minute from one visitor (IP) to public endpoints: guest chat, booking requests. */
    requestsPerMinute: env.RATE_LIMIT_PER_MINUTE,
    /** After this many guest messages in 24 hours, the AI stops and staff take over. Caps AI cost. */
    maxGuestMessagesPerDay: env.MAX_GUEST_MESSAGES_PER_DAY,
  },
  site: {
    /** Public address of this app, used for canonical links and hreflang on hotel websites. */
    baseUrl: env.PUBLIC_BASE_URL.replace(/\/$/, ""),
  },
  privacy: {
    /** Shown in the privacy notice; apply it with the retention function in the database. */
    retentionDays: env.DATA_RETENTION_DAYS,
    bookingRetentionDays: env.BOOKING_RETENTION_DAYS,
  },
} as const;

export const isDemoMode = config.ai.useMock || !config.supabase.enabled;
