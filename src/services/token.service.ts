import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export interface TokenPayload {
  userId: string;
  role: "customer" | "professional" | "admin";
  iat?: number;
  exp?: number;
}

export function verifyToken(token: string): TokenPayload {
  const payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  return payload;
}

export function extractBearerToken(
  authHeader: string | undefined,
): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.slice(7).trim() || null;
}

export function isTokenExpired(payload: TokenPayload): boolean {
  if (!payload.exp) return false;
  return Date.now() >= payload.exp * 1000;
}

