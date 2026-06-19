import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../src/app.js";
import type { Server } from "http";

const JWT_SECRET = process.env["JWT_SECRET"]!;
let server: Server;
beforeAll(() => { server = app.listen(0); });
afterAll(() => { server.close(); });

function makeToken(payload = { userId: "user-123", role: "customer" }, expiresIn: string | number = "1h") {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

describe("Public routes bypass auth", () => {
  it("GET /api/health — no token needed", async () => {
    expect((await request(app).get("/api/health")).status).not.toBe(401);
  });
  it("POST /api/auth/login — no token needed", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "t@t.com", password: "p" });
    expect(res.status).not.toBe(401);
  });
  it("POST /api/auth/register — no token needed", async () => {
    const res = await request(app).post("/api/auth/register").send({ email: "t@t.com", password: "password123" });
    expect(res.status).not.toBe(401);
  });
  it("POST /api/auth/refresh — no token needed", async () => {
    expect((await request(app).post("/api/auth/refresh").send({})).status).not.toBe(401);
  });
});

describe("Protected routes require token", () => {
  it("returns 401 UNAUTHORIZED with no token", async () => {
    const res = await request(app).get("/api/bookings");
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
    expect(res.body.error.message).toBe("No token provided");
  });
  it("returns 401 UNAUTHORIZED with bad JWT", async () => {
    const res = await request(app).get("/api/bookings").set("Authorization", "Bearer bad.token.here");
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });
  it("returns 401 UNAUTHORIZED with no Bearer prefix", async () => {
    const res = await request(app).get("/api/bookings").set("Authorization", makeToken());
    expect(res.status).toBe(401);
  });
  it("returns 401 TOKEN_EXPIRED for expired token", async () => {
    const expired = makeToken({ userId: "u", role: "customer" }, -1);
    const res = await request(app).get("/api/bookings").set("Authorization", `Bearer ${expired}`);
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("TOKEN_EXPIRED");
  });
});

describe("Login validation", () => {
  it("rejects invalid email", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "not-email", password: "abc" });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.message).toContain("Invalid email format");
  });
  it("rejects empty password", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "u@u.com", password: "" });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});

describe("Register validation", () => {
  it("rejects password shorter than 8 characters", async () => {
    const res = await request(app).post("/api/auth/register").send({ email: "u@u.com", password: "short" });
    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain("8 characters");
  });
});
