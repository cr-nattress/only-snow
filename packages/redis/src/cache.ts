import type { RedisClient } from './client.js';

/**
 * Generic cache helper with typed get/set/invalidate operations.
 * Falls back to the provided fetcher on cache miss.
 */
export const cache = {
  async get<T>(redis: RedisClient, key: string): Promise<T | null> {
    const data = await redis.get<T>(key);
    return data;
  },

  async set<T>(redis: RedisClient, key: string, data: T, ttlSeconds: number): Promise<void> {
    await redis.set(key, data, { ex: ttlSeconds });
  },

  async invalidate(redis: RedisClient, key: string): Promise<void> {
    await redis.del(key);
  },

  async invalidatePattern(redis: RedisClient, pattern: string): Promise<void> {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await Promise.all(keys.map((key) => redis.del(key)));
    }
  },

  /**
   * Cache-aside pattern: check cache first, fetch on miss, store result.
   */
  async getOrSet<T>(
    redis: RedisClient,
    key: string,
    ttlSeconds: number,
    fetcher: () => Promise<T>,
  ): Promise<T> {
    const cached = await redis.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetcher();
    await redis.set(key, data, { ex: ttlSeconds });
    return data;
  },
};
