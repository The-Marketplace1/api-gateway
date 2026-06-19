import type { Request, Response, NextFunction } from "express";
import { errorResponse } from "../utils/response.js";

const MAX_HEADER_SIZE = 8 * 1024; // 8KB
const DANGEROUS_PATTERNS = [/<script/i, /javascript:/i, /on\w+\s*=/i];

export function validateHeaders(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const headerString = JSON.stringify(req.headers);

  if (headerString.length > MAX_HEADER_SIZE) {
    errorResponse(res, 431, "REQUEST_HEADER_TOO_LARGE", "Request headers too large");
    return;
  }

  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(headerString)) {
      errorResponse(res, 400, "INVALID_HEADERS", "Potentially malicious header detected");
      return;
    }
  }

  next();
}

export function validateRequestId(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const requestId = req.headers["x-request-id"];
  if (requestId && typeof requestId === "string" && requestId.length > 128) {
    req.headers["x-request-id"] = requestId.substring(0, 128);
  }
  next();
}

export function rejectMalformedJson(
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (err instanceof SyntaxError && "body" in err) {
    errorResponse(res, 400, "MALFORMED_JSON", "Request body contains invalid JSON");
    return;
  }
  next(err);
}

