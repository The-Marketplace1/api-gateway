import type { ClientRequest } from "node:http";
import type { Request } from "express";
import { env } from "../config/env.js";

export function applyServiceAuthentication(proxyReq: ClientRequest, req: Request): void {
  if (env.INTERNAL_SERVICE_TOKEN) {
    proxyReq.setHeader("X-Service-Auth", env.INTERNAL_SERVICE_TOKEN);
  }
  proxyReq.setHeader("X-Request-ID", req.requestId ?? req.headers["x-request-id"] ?? "");
  proxyReq.setHeader("X-Platform", env.PLATFORM_NAME);
  proxyReq.setHeader("X-Gateway-Service", env.SERVICE_NAME);
  if (req.headers["traceparent"]) {
    proxyReq.setHeader("traceparent", req.headers["traceparent"]);
  }
  if (req.headers["idempotency-key"]) {
    proxyReq.setHeader("Idempotency-Key", req.headers["idempotency-key"]);
  }
}

