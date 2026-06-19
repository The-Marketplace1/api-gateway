import rateLimit from "express-rate-limit";
import { RedisStore, type SendCommandFn } from "rate-limit-redis";
import type { Request, Response } from "express";
import { getRedisClient } from "../config/redis.js";
import { errorResponse } from "../utils/response.js";

function makeSendCommand(prefix: string): { store: RedisStore } {
  const sendCommand: SendCommandFn = async (...args: string[]) => {
    const client = getRedisClient();
    return client.call(args[0] as string, ...args.slice(1)) as ReturnType<SendCommandFn>;
  };
  return {
    store: new RedisStore({
      sendCommand,
      prefix: `rate_limit:${prefix}:`,
    }),
  };
}

function rateLimitHandler(_req: Request, res: Response): void {
  errorResponse(
    res,
    429,
    "RATE_LIMIT_EXCEEDED",
    "Too many requests, please try again later",
  );
}

export const globalAnonymousLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeSendCommand("anon").store,
  skip: (req: Request) => !!req.user,
  handler: rateLimitHandler,
  keyGenerator: (req: Request) => req.ip ?? "unknown",
});

export const globalAuthenticatedLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeSendCommand("auth").store,
  skip: (req: Request) => !req.user,
  handler: rateLimitHandler,
  keyGenerator: (req: Request) =>
    req.user ? `user:${req.user.userId}` : (req.ip ?? "unknown"),
});

export const authEndpointLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeSendCommand("auth_endpoint").store,
  handler: rateLimitHandler,
  keyGenerator: (req: Request) => req.ip ?? "unknown",
});

export const loginAttemptLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeSendCommand("login").store,
  handler: (_req: Request, res: Response) => {
    errorResponse(
      res,
      429,
      "TOO_MANY_LOGIN_ATTEMPTS",
      "Too many login attempts, please try again later",
    );
  },
  keyGenerator: (req: Request) => req.ip ?? "unknown",
});

