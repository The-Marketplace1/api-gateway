import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { errorResponse } from "../utils/response.js";

const counters = new Map<string, number>();
let startedAt = Date.now();

function increment(key: string): void {
  counters.set(key, (counters.get(key) ?? 0) + 1);
}

export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const started = process.hrtime.bigint();
  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - started) / 1_000_000;
    increment(`http_requests_total{method="${req.method}",status="${res.statusCode}"}`);
    increment(`http_request_duration_ms_bucket{route="${req.route?.path ?? req.path}"}`);
    if (durationMs > env.UPSTREAM_TIMEOUT_MS) {
      increment("http_slow_requests_total");
    }
  });
  next();
}

export function metricsAuthorizationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const configuredToken = env.METRICS_TOKEN;
  if (!configuredToken && env.NODE_ENV !== "production") {
    next();
    return;
  }

  if (configuredToken && req.headers["x-metrics-token"] === configuredToken) {
    next();
    return;
  }

  errorResponse(res, 404, "NOT_FOUND", "Route not found");
}

export function metricsText(): string {
  const lines = [
    "# HELP gateway_uptime_seconds Time since the gateway process started.",
    "# TYPE gateway_uptime_seconds gauge",
    `gateway_uptime_seconds ${(Date.now() - startedAt) / 1000}`,
  ];
  for (const [key, value] of counters) {
    lines.push(`${key} ${value}`);
  }
  return `${lines.join("\n")}\n`;
}

export function resetMetricsForTests(): void {
  counters.clear();
  startedAt = Date.now();
}

