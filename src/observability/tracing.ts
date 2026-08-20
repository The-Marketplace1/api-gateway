import { randomBytes } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { context, propagation, trace } from "@opentelemetry/api";

const TRACEPARENT_PATTERN = /^00-[0-9a-f]{32}-[0-9a-f]{16}-[0-9a-f]{2}$/;
const tracer = trace.getTracer(process.env["OTEL_SERVICE_NAME"] ?? "api-gateway");

function newTraceparent(): string {
  const traceId = randomBytes(16).toString("hex");
  const spanId = randomBytes(8).toString("hex");
  return `00-${traceId}-${spanId}-01`;
}

export function tracingMiddleware(req: Request, res: Response, next: NextFunction): void {
  const supplied = req.headers.traceparent;
  const traceparent =
    typeof supplied === "string" && TRACEPARENT_PATTERN.test(supplied)
      ? supplied
      : newTraceparent();

  req.headers.traceparent = traceparent;
  res.setHeader("traceparent", traceparent);

  const span = tracer.startSpan(`${req.method} ${req.path}`, {
    attributes: {
      "http.request.method": req.method,
      "url.path": req.path,
      "service.name": process.env["OTEL_SERVICE_NAME"] ?? "api-gateway",
    },
  });
  const spanContext = trace.setSpan(context.active(), span);
  propagation.inject(spanContext, req.headers, {
    set(carrier, key, value) {
      carrier[key] = value;
    },
  });

  res.on("finish", () => {
    span.setAttribute("http.response.status_code", res.statusCode);
    span.end();
  });

  context.with(spanContext, next);
}

