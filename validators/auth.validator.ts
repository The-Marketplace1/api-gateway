import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { errorResponse } from "../utils/response.js";

const bearerTokenSchema = z
  .string()
  .regex(/^Bearer\s[\w-]+\.[\w-]+\.[\w-]+$/, "Invalid Bearer token format");

const loginBodySchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

const registerBodySchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["customer", "professional"]).default("customer"),
});

export function validateAuthHeader(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    next();
    return;
  }

  const result = bearerTokenSchema.safeParse(authHeader);
  if (!result.success) {
    errorResponse(res, 401, "INVALID_TOKEN_FORMAT", "Malformed Authorization header");
    return;
  }

  next();
}

export function validateLoginBody(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const result = loginBodySchema.safeParse(req.body);
  if (!result.success) {
    const issues = result.error.issues.map((i) => i.message).join(", ");
    errorResponse(res, 400, "VALIDATION_ERROR", issues);
    return;
  }
  next();
}

export function validateRegisterBody(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const result = registerBodySchema.safeParse(req.body);
  if (!result.success) {
    const issues = result.error.issues.map((i) => i.message).join(", ");
    errorResponse(res, 400, "VALIDATION_ERROR", issues);
    return;
  }
  next();
}

