import { z } from "zod";

/**
 * All environment configuration is read and validated here, once.
 * Every other module imports `config` instead of touching process.env.
 */
const optional = z
  .string()
  .optional()
  .transform((v) => (v && v.trim().length > 0 ? v.trim() : undefined));

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
} as const;

export const isDemoMode = config.ai.useMock || !config.supabase.enabled;
