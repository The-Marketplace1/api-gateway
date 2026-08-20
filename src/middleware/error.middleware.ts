import type { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger.js";

interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export function notFoundMiddleware(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
}

export function errorMiddleware(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const statusCode = err.statusCode ?? 500;
  const code = err.code ?? "INTERNAL_SERVER_ERROR";
  const message =
    statusCode === 500 ? "An unexpected error occurred" : err.message;

  logger.error(
    {
      err,
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      statusCode,
    },
    "Request error",
  );

  res.status(statusCode).json({
    success: false,
    error: { code, message },
  });
}

