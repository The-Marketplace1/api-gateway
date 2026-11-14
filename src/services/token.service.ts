import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env.js";

const accessTokenClaimsSchema = z.object({
  sub: z.string().min(1).max(128),
  email: z.string().email().max(320),
  role: z.enum(["customer", "professional", "admin"]),
  sessionId: z.string().uuid(),
  iat: z.number().int().nonnegative(),
  exp: z.number().int().positive(),
}).passthrough().superRefine((claims, ctx) => {
  if (claims.exp <= claims.iat) {
    ctx.addIssue({
      code: "custom",
      path: ["exp"],
      message: "Expiration must follow issuance",
    });
  }
  if (claims.iat > Math.floor(Date.now() / 1000) + 30) {
    ctx.addIssue({
      code: "custom",
      path: ["iat"],
      message: "Issued-at time is in the future",
    });
  }
});

export interface AccessTokenClaims {
  sub: string;
  email: string;
  role: "customer" | "professional" | "admin";
  sessionId: string;
  iat: number;
  exp: number;
}

export function verifyAccessToken(token: string): AccessTokenClaims {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET, {
    algorithms: ["HS256"],
  });

  return accessTokenClaimsSchema.parse(decoded);
}
