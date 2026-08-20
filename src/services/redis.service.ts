import { getRedisClient } from "../config/redis.js";

const BLACKLIST_PREFIX = "blacklist:";
const SESSION_PREFIX = "session:";
const BLACKLIST_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export async function isTokenBlacklisted(token: string): Promise<boolean> {
  try {
    const client = getRedisClient();
    const key = `${BLACKLIST_PREFIX}${token}`;
    const exists = await client.exists(key);
    return exists === 1;
  } catch {
    return false;
  }
}

export async function blacklistToken(token: string): Promise<void> {
  const client = getRedisClient();
  const key = `${BLACKLIST_PREFIX}${token}`;
  await client.set(key, "1", "EX", BLACKLIST_TTL_SECONDS);
}

export async function getSession(userId: string): Promise<string | null> {
  try {
    const client = getRedisClient();
    return await client.get(`${SESSION_PREFIX}${userId}`);
  } catch {
    return null;
  }
}

export async function setSession(
  userId: string,
  data: string,
  ttlSeconds = 3600,
): Promise<void> {
  const client = getRedisClient();
  await client.set(`${SESSION_PREFIX}${userId}`, data, "EX", ttlSeconds);
}

