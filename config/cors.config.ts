import type { CorsOptions } from "cors";
import { env } from "./env.js";
import { logger } from "../lib/logger.js";
import { PLATFORM_HEADERS } from "../constants/platform.constants.js";

export function buildCorsOptions(): CorsOptions {
  const allowedOrigins = env.ALLOWED_ORIGINS.split(",").map((o: string) =>
    o.trim(),
  );

  return {
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn({ origin }, "CORS: blocked request from disallowed origin");
        callback(new Error(`Origin ${origin} not allowed by CORS policy`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      PLATFORM_HEADERS.REQUEST_ID,
      PLATFORM_HEADERS.USER_ID,
      PLATFORM_HEADERS.USER_ROLE,
    ],
    exposedHeaders: [
      PLATFORM_HEADERS.REQUEST_ID,
      PLATFORM_HEADERS.PLATFORM,
      PLATFORM_HEADERS.PLATFORM_VERSION,
    ],
  };
}

