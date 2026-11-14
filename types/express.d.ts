declare namespace Express {
  interface Request {
    requestId?: string;
    user?: {
      userId: string;
      email: string;
      role: "customer" | "professional" | "admin";
      sessionId: string;
    };
  }
}
