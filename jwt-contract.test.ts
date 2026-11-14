import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../src/app.js";
import { getRedisClient } from "../src/config/redis.js";

const SECRET = process.env["JWT_ACCESS_SECRET"]!;
const sessionId = "8e252b44-dc3b-4b2d-9b25-8d0d5f3d9b21";
const claims = {
  sub: "user-123",
  email: "user@example.com",
  role: "customer" as const,
  sessionId,
};
const sessionKey = `refresh:${claims.sub}:${sessionId}`;

function makeToken(
  payload: Record<string, unknown> = claims,
  secret = SECRET,
  algorithm: jwt.Algorithm = "HS256",
  expiresIn: string | number = "1h",
) {
  return jwt.sign(payload, secret, { algorithm, expiresIn });
}

beforeEach(async () => {
  await getRedisClient().set(sessionKey, "active-refresh-token", "EX", 60);
});

async function protectedRequest(token: string) {
  return request(app).get("/api/bookings").set("Authorization", `Bearer ${token}`);
}

describe("Auth Service access-token contract", () => {
  it("accepts HS256 sub claims without userId, iss, or aud claims", async () => {
    const res = await protectedRequest(makeToken());
    expect(res.status).not.toBe(401);
  });

  it("rejects a token with userId but no sub", async () => {
    const res = await protectedRequest(
      makeToken({
        userId: claims.sub,
        email: claims.email,
        role: claims.role,
        sessionId,
      }),
    );
    expect(res.status).toBe(401);
  });

  it.each([
    ["missing email", { ...claims, email: undefined }],
    ["invalid role", { ...claims, role: "owner" }],
    ["missing role", { sub: claims.sub, email: claims.email, sessionId }],
    ["missing sessionId", { sub: claims.sub, email: claims.email, role: claims.role }],
    ["invalid sessionId", { ...claims, sessionId: "not-a-uuid" }],
  ])("rejects %s", async (_label, payload) => {
    const res = await protectedRequest(makeToken(payload as Record<string, unknown>));
    expect(res.status).toBe(401);
  });

  it("rejects expired tokens and signatures from a different secret", async () => {
    const expired = makeToken(claims, SECRET, "HS256", -1);
    expect((await protectedRequest(expired)).status).toBe(401);

    expect(
      (await protectedRequest(
        makeToken(claims, "different-test-secret-that-is-32chars"),
      )).status,
    ).toBe(401);
  });

  it.each(["HS384", "HS512"] as const)("rejects %s tokens", async (algorithm) => {
    const res = await protectedRequest(makeToken(claims, SECRET, algorithm));
    expect(res.status).toBe(401);
  });

  it("rejects a token after the Auth Service session key is revoked", async () => {
    const token = makeToken();
    await getRedisClient().del(sessionKey);
    const res = await protectedRequest(token);
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("SESSION_REVOKED");
  });
});
