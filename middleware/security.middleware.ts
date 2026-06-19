import type { Request, Response, NextFunction } from "express";
import { PLATFORM, PLATFORM_HEADERS } from "../constants/platform.constants.js";

export function platformIdentityMiddleware(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  res.setHeader(PLATFORM_HEADERS.PLATFORM, PLATFORM.NAME);
  res.setHeader(PLATFORM_HEADERS.PLATFORM_VERSION, PLATFORM.VERSION);
  res.setHeader(PLATFORM_HEADERS.SERVICE, PLATFORM.SERVICE);
  next();
}

export function requestContextMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  req.headers["x-platform"] = PLATFORM.NAME;
  req.headers["x-gateway-service"] = PLATFORM.SERVICE;
  next();
}

export function sanitizePayloadMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const contentType = req.headers["content-type"] ?? "";

  if (
    req.method !== "GET" &&
    req.method !== "DELETE" &&
    req.method !== "OPTIONS" &&
    contentType &&
    !contentType.includes("application/json") &&
    !contentType.includes("application/x-www-form-urlencoded") &&
    !contentType.includes("multipart/form-data")
  ) {
    res.status(415).json({
      success: false,
      error: {
        code: "UNSUPPORTED_MEDIA_TYPE",
        message: "Content-Type must be application/json",
      },
    });
    return;
  }

  next();
}

