import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().min(1, "PORT is required"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),

  REDIS_URL: z.string().url("REDIS_URL must be a valid URL"),

  AUTH_SERVICE_URL: z.string().url("AUTH_SERVICE_URL must be a valid URL"),
  BACKEND_API_URL: z.string().url("BACKEND_API_URL must be a valid URL"),
  PAYMENT_SERVICE_URL: z.string().url("PAYMENT_SERVICE_URL must be a valid URL"),
  REALTIME_SERVICE_URL: z.string().url("REALTIME_SERVICE_URL must be a valid URL"),
  NOTIFICATION_SERVICE_URL: z.string().url("NOTIFICATION_SERVICE_URL must be a valid URL"),

  ALLOWED_ORIGINS: z.string().min(1, "ALLOWED_ORIGINS is required — comma-separated list of allowed origins"),

  PLATFORM_NAME: z.string().default("Marketplace"),
  PLATFORM_VERSION: z.string().default("v1"),
  SERVICE_NAME: z.string().default("api-gateway"),

  LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).default("info"),
});

type EnvIssue = z.ZodIssue;

function validateEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const missing = parsed.error.issues
      .map((i: EnvIssue) => `  ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(
      `[api-gateway] Missing or invalid environment variables:\n${missing}\n\nSee .env.example for the full required configuration.`,
    );
  }
  return parsed.data;
}

export const env = validateEnv();
export type Env = typeof env;

