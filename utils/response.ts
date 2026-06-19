import type { Response } from "express";

export function successResponse<T>(
  res: Response,
  data: T,
  statusCode = 200,
): void {
  res.status(statusCode).json({ success: true, data });
}

export function errorResponse(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
): void {
  res.status(statusCode).json({
    success: false,
    error: { code, message },
  });
}

