import type { Request, Response } from "express";
import { logger } from "../lib/logger.js";
import { LOG_CONTEXT } from "../constants/platform.constants.js";

export function logIncomingRequest(req: Request): void {
  logger.info(
    {
      ...LOG_CONTEXT,
      event: "request_received",
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      userId: req.user?.userId,
      role: req.user?.role,
    },
    `[${LOG_CONTEXT.platform} ${LOG_CONTEXT.service}] Incoming request: ${req.method} ${req.path}`,
  );
}

export function logOutgoingResponse(
  req: Request,
  res: Response,
  durationMs: number,
): void {
  const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";

  logger[level](
    {
      ...LOG_CONTEXT,
      event: "request_completed",
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs,
      userId: req.user?.userId,
    },
    `[${LOG_CONTEXT.platform} ${LOG_CONTEXT.service}] ${req.method} ${req.path} → ${res.statusCode} (${durationMs}ms)`,
  );
}

export function logProxyForward(
  req: Request,
  targetService: string,
  targetUrl: string,
): void {
  logger.debug(
    {
      ...LOG_CONTEXT,
      event: "proxy_forward",
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      targetService,
      targetUrl,
    },
    `[${LOG_CONTEXT.platform} ${LOG_CONTEXT.service}] Forwarding to ${targetService}`,
  );
}

export function logAuthEvent(
  event: "token_verified" | "token_rejected" | "token_blacklisted",
  req: Request,
  detail?: string,
): void {
  const level = event === "token_verified" ? "info" : "warn";

  logger[level](
    {
      ...LOG_CONTEXT,
      event,
      requestId: req.requestId,
      path: req.path,
      userId: req.user?.userId,
      detail,
    },
    `[${LOG_CONTEXT.platform} ${LOG_CONTEXT.service}] Auth event: ${event}`,
  );
}

