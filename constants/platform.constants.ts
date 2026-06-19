export const PLATFORM = {
  NAME: process.env["PLATFORM_NAME"] ?? "Marketplace",
  SERVICE: process.env["SERVICE_NAME"] ?? "api-gateway",
  VERSION: process.env["PLATFORM_VERSION"] ?? "v1",
} as const;

export const PLATFORM_HEADERS = {
  PLATFORM: "X-Platform",
  PLATFORM_VERSION: "X-Platform-Version",
  REQUEST_ID: "X-Request-ID",
  USER_ID: "X-User-ID",
  USER_ROLE: "X-User-Role",
  SERVICE: "X-Gateway-Service",
} as const;

export const LOG_CONTEXT = {
  platform: PLATFORM.NAME,
  service: PLATFORM.SERVICE,
  version: PLATFORM.VERSION,
} as const;

