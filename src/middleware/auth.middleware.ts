import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { errorResponse } from "../utils/response.js";

export interface JwtUserPayload {
  userId: string;
  role: "customer" | "professional" | "admin";
  email?: string;
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    errorResponse(res, 401, "UNAUTHORIZED", "No token provided");
    return;
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    errorResponse(res, 401, "UNAUTHORIZED", "No token provided");
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtUserPayload;
    req.user = decoded;
    if (decoded.userId) {
      req.headers["x-user-id"] = decoded.userId;
    }
    if (decoded.role) {
      req.headers["x-user-role"] = decoded.role;
    }
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      errorResponse(res, 401, "TOKEN_EXPIRED", "Token has expired");
      return;
    }
    errorResponse(res, 401, "UNAUTHORIZED", "Invalid token");
  }
}
