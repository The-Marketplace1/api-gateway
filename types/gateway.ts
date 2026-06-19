import type { Request } from "express";

export interface GatewayRequest extends Request {
  requestId?: string;
  user?: {
    userId: string;
    role: "customer" | "professional" | "admin";
  };
}

