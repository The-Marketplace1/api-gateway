import type { Request, Response, NextFunction } from "express";
import { errorResponse } from "../utils/response.js";

type Role = "customer" | "professional" | "admin";

export function requireRole(...allowedRoles: Role[]) {
  return function (req: Request, res: Response, next: NextFunction): void {
    if (!req.user) {
      errorResponse(res, 401, "UNAUTHORIZED", "Authentication required");
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      errorResponse(
        res,
        403,
        "FORBIDDEN",
        `Access restricted to: ${allowedRoles.join(", ")}`,
      );
      return;
    }

    next();
  };
}

export const requireAdmin = requireRole("admin");
export const requireCustomer = requireRole("customer");
export const requireProfessional = requireRole("professional");
export const requireCustomerOrProfessional = requireRole(
  "customer",
  "professional",
);

