import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import type { Server } from "http";

let server: Server;
beforeAll(() => { server = app.listen(0); });
afterAll(() => { server.close(); });

describe("Health routes always reachable", () => {
  it("/api/health is 200", async () => { expect((await request(app).get("/api/health")).status).toBe(200); });
  it("/api/healthz is 200", async () => { expect((await request(app).get("/api/healthz")).status).toBe(200); });
});

describe("Public route coverage — none return 401", () => {
  const cases = [
    ["post", "/api/auth/login",    { email: "a@b.com", password: "p" }],
    ["post", "/api/auth/register", { email: "a@b.com", password: "password1" }],
    ["post", "/api/auth/refresh",  {}],
    ["get",  "/api/auth/oauth/google", null],
    ["get",  "/api/auth/oauth/apple",  null],
  ] as const;

  for (const [method, path, body] of cases) {
    it(`${method.toUpperCase()} ${path}`, async () => {
      const req = (request(app) as any)[method](path);
      if (body) req.send(body);
      expect((await req).status).not.toBe(401);
    });
  }
});

describe("Protected routes return 401 without token", () => {
  const paths = ["/api/bookings", "/api/users", "/api/payments/history",
                 "/api/realtime/status", "/api/notifications"];
  for (const path of paths) {
    it(`GET ${path} → 401`, async () => {
      expect((await request(app).get(path)).status).toBe(401);
    });
  }
});

describe("Rate limit headers present", () => {
  it("health endpoint includes RateLimit headers", async () => {
    const res = await request(app).get("/api/health");
    const has = "ratelimit-limit" in res.headers || "ratelimit-remaining" in res.headers;
    expect(has).toBe(true);
  });
});

describe("Service config is correct", () => {
  it("auth → auth-service at /auth", async () => {
    const { SERVICES } = await import("../src/config/services.config.js");
    expect(SERVICES.auth).toMatchObject({ name: "auth-service", path: "/auth" });
  });
  it("payment → payment-service at /payments", async () => {
    const { SERVICES } = await import("../src/config/services.config.js");
    expect(SERVICES.payment).toMatchObject({ name: "payment-service", path: "/payments" });
  });
  it("realtime → realtime-service at /realtime", async () => {
    const { SERVICES } = await import("../src/config/services.config.js");
    expect(SERVICES.realtime).toMatchObject({ name: "realtime-service", path: "/realtime" });
  });
  it("notification → notification-service at /notifications", async () => {
    const { SERVICES } = await import("../src/config/services.config.js");
    expect(SERVICES.notification).toMatchObject({ name: "notification-service", path: "/notifications" });
  });
});
