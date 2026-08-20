import { env } from "./env.js";

export interface ServiceConfig {
  name: string;
  url: string;
  path: string;
}

export const SERVICES: Record<string, ServiceConfig> = {
  auth: {
    name: "auth-service",
    url: env.AUTH_SERVICE_URL,
    path: "/auth",
  },
  backend: {
    name: "backend-api",
    url: env.BACKEND_API_URL,
    path: "/api",
  },
  payment: {
    name: "payment-service",
    url: env.PAYMENT_SERVICE_URL,
    path: "/payments",
  },
  realtime: {
    name: "realtime-service",
    url: env.REALTIME_SERVICE_URL,
    path: "/realtime",
  },
  notification: {
    name: "notification-service",
    url: env.NOTIFICATION_SERVICE_URL,
    path: "/notifications",
  },
} as const;

export function getServiceByPath(path: string): ServiceConfig | undefined {
  return Object.values(SERVICES).find((svc) => path.startsWith(svc.path));
}

