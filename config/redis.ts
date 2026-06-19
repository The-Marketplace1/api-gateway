import Redis from "ioredis";
import { env } from "./env.js";
import { logger } from "../lib/logger.js";

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    redisClient.on("connect", () => {
      logger.info("Redis connected");
    });

    redisClient.on("error", (err) => {
      logger.error({ err }, "Redis error");
    });

    redisClient.on("close", () => {
      logger.warn("Redis connection closed");
    });
  }
  return redisClient;
}

export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

