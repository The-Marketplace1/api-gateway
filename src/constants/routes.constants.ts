export const SERVICE_PATHS = {
  AUTH: "/api/auth",
  API: "/api",
  PAYMENTS: "/api/payments",
  REALTIME: "/api/realtime",
  NOTIFICATIONS: "/api/notifications",
} as const;

export const PUBLIC_ROUTES = [
  "/api/auth/register",
  "/api/auth/login",
  "/api/auth/refresh",
  "/api/auth/oauth/google",
  "/api/auth/oauth/apple",
  "/api/health",
  "/api/healthz",
] as const;

export const AUTH_ONLY_PATHS = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
] as const;

export const ADMIN_PATHS = ["/api/admin"] as const;

