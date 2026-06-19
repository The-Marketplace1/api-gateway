import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import type { Server } from "http";

let server: Server;
beforeAll(() => { server = app.listen(0); });
afterAll(() => { server.close(); });

describe("Health endpoints", () => {
  it("GET /api/health returns 200 with correct shape", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: "healthy",
      service: expect.any(String),
      platform: expect.any(String),
      version: expect.any(String),
      timestamp: expect.any(String),
      dependencies: { redis: expect.stringMatching(/^ok|degraded$/) },
    });
  });

  it("GET /api/healthz returns { status: 'ok' }", async () => {
    const res = await request(app).get("/api/healthz");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});

describe("Platform identity headers", () => {
  it("every response carries X-Platform", async () => {
    const res = await request(app).get("/api/health");
    expect(res.headers["x-platform"]).toBeDefined();
  });
  it("every response carries X-Platform-Version", async () => {
    const res = await request(app).get("/api/health");
    expect(res.headers["x-platform-version"]).toBeDefined();
  });
  it("every response carries X-Gateway-Service", async () => {
    const res = await request(app).get("/api/health");
    expect(res.headers["x-gateway-service"]).toBeDefined();
  });
  it("every response carries X-Request-ID", async () => {
    const res = await request(app).get("/api/health");
    expect(res.headers["x-request-id"]).toBeDefined();
  });
  it("passes through a client-provided X-Request-ID unchanged", async () => {
    const customId = "test-request-id-12345";
    const res = await request(app).get("/api/health").set("X-Request-ID", customId);
    expect(res.headers["x-request-id"]).toBe(customId);
  });
});

describe("Payload validation", () => {
  it("rejects malformed JSON with 400 MALFORMED_JSON", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send("{bad json");
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("MALFORMED_JSON");
  });

  it("rejects unsupported Content-Type with 415", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "text/plain")
      .send("raw body");
    expect(res.status).toBe(415);
    expect(res.body.error.code).toBe("UNSUPPORTED_MEDIA_TYPE");
  });
});

describe("Error response shape", () => {
  it("all errors use { success: false, error: { code, message } }", async () => {
    const res = await request(app).get("/api/protected");
    expect(res.body).toMatchObject({
      success: false,
      error: { code: expect.any(String), message: expect.any(String) },
    });
  });
});
