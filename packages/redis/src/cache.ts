import type { RedisClient } from './client.js';

/**
 * Generic cache helper with typed get/set/invalidate operations.
 * All methods accept `RedisClient | null` — when null, caching is
 * skipped and fetchers are called directly. This allows the backend
 * to run without Redis configured (useful for local development).
 */
export const cache = {
  async get<T>(redis: RedisClient | null, key: string): Promise<T | null> {
    if (!redis) return null;
    const data = await redis.get<T>(key);
    return data;
  },

  async set<T>(redis: RedisClient | null, key: string, data: T, ttlSeconds: number): Promise<void> {
    if (!redis) return;
    await redis.set(key, data, { ex: ttlSeconds });
  },

  async invalidate(redis: RedisClient | null, key: string): Promise<void> {
    if (!redis) return;
    await redis.del(key);
  },

  async invalidatePattern(redis: RedisClient | null, pattern: string): Promise<void> {
    if (!redis) return;
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await Promise.all(keys.map((key) => redis.del(key)));
    }
  },

  /**
   * Cache-aside pattern: check cache first, fetch on miss, store result.
   * When redis is null, always calls fetcher directly (no caching).
   */
  async getOrSet<T>(
    redis: RedisClient | null,
    key: string,
    ttlSeconds: number,
    fetcher: () => Promise<T>,
  ): Promise<T> {
    if (redis) {
      const cached = await redis.get<T>(key);
      if (cached !== null) {
        return cached;
      }
    }

    const data = await fetcher();
    if (redis) {
      await redis.set(key, data, { ex: ttlSeconds });
    }
    return data;
  },
};
