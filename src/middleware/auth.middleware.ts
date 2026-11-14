import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { verifyAccessToken } from "../services/token.service.js";
import { getRedisClient } from "../config/redis.js";
import { errorResponse } from "../utils/response.js";

export interface JwtUserPayload {
  userId: string;
  email: string;
  role: "customer" | "professional" | "admin";
  sessionId: string;
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
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

  let claims: ReturnType<typeof verifyAccessToken>;
  try {
    claims = verifyAccessToken(token);
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      errorResponse(res, 401, "TOKEN_EXPIRED", "Token has expired");
      return;
    }
    errorResponse(res, 401, "UNAUTHORIZED", "Invalid token");
    return;
  }

  try {
    // Auth Service lifecycle: session is stored in Redis under refresh:{userId}:{sessionId}
    // and revoked by deleting that key. This is the active-session check the gateway must enforce.
    const sessionKey = `refresh:${claims.sub}:${claims.sessionId}`;
    const activeSession = await getRedisClient().exists(sessionKey);
    if (activeSession !== 1) {
      errorResponse(res, 401, "SESSION_REVOKED", "Session is revoked or expired");
      return;
    }
  } catch {
    errorResponse(
      res,
      503,
      "AUTHENTICATION_UNAVAILABLE",
      "Authentication service temporarily unavailable",
    );
    return;
  }

  req.user = {
    userId: claims.sub,
    email: claims.email,
    role: claims.role,
    sessionId: claims.sessionId,
  };

  // Replace any inbound identity values with claims verified by this gateway.
  req.headers["x-user-id"] = claims.sub;
  req.headers["x-user-role"] = claims.role;
  req.headers["x-user-email"] = claims.email;
  req.headers["x-session-id"] = claims.sessionId;

  next();
}
