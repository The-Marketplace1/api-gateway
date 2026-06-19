import { Router } from "express";
import { PLATFORM } from "../constants/platform.constants.js";
import { getRedisClient } from "../config/redis.js";

const router = Router();

async function checkRedis(): Promise<"ok" | "degraded"> {
  try {
    const client = getRedisClient();
    await client.ping();
    return "ok";
  } catch {
    return "degraded";
  }
}

router.get("/health", async (_req, res) => {
  const redis = await checkRedis();
  const status = redis === "ok" ? "healthy" : "degraded";

  res.status(redis === "ok" ? 200 : 207).json({
    status,
    service: PLATFORM.SERVICE,
    platform: PLATFORM.NAME,
    version: PLATFORM.VERSION,
    timestamp: new Date().toISOString(),
    dependencies: { redis },
  });
});

router.get("/healthz", (_req, res) => {
  res.json({ status: "ok" });
});

export default router;

