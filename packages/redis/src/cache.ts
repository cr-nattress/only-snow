import type { RedisClient } from './client.js';

/**
 * Generic cache helper with typed get/set/invalidate operations.
 * All methods accept `RedisClient | null` — when null, caching is
 * skipped and fetchers are called directly. This allows the backend
 * to run without Redis configured (useful for local development).
 *
 * All Redis operations are wrapped in try/catch so that transient
 * Redis failures (connection timeouts, cold starts, etc.) never
 * take down API routes. Cache is an optimization, not a requirement.
 */
export const cache = {
  async get<T>(redis: RedisClient | null, key: string): Promise<T | null> {
    if (!redis) return null;
    try {
      return await redis.get<T>(key);
    } catch (err) {
      console.warn(`[cache] get failed for key=${key}:`, (err as Error).message);
      return null;
    }
  },

  async set<T>(redis: RedisClient | null, key: string, data: T, ttlSeconds: number): Promise<void> {
    if (!redis) return;
    try {
      await redis.set(key, data, { ex: ttlSeconds });
    } catch (err) {
      console.warn(`[cache] set failed for key=${key}:`, (err as Error).message);
    }
  },

  async invalidate(redis: RedisClient | null, key: string): Promise<void> {
    if (!redis) return;
    try {
      await redis.del(key);
    } catch (err) {
      console.warn(`[cache] invalidate failed for key=${key}:`, (err as Error).message);
    }
  },

  async invalidatePattern(redis: RedisClient | null, pattern: string): Promise<void> {
    if (!redis) return;
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await Promise.all(keys.map((key) => redis.del(key)));
      }
    } catch (err) {
      console.warn(`[cache] invalidatePattern failed for pattern=${pattern}:`, (err as Error).message);
    }
  },

  /**
   * Cache-aside pattern: check cache first, fetch on miss, store result.
   * When redis is null, always calls fetcher directly (no caching).
   * Redis failures are swallowed — the fetcher is always called on cache miss or error.
   */
  async getOrSet<T>(
    redis: RedisClient | null,
    key: string,
    ttlSeconds: number,
    fetcher: () => Promise<T>,
  ): Promise<T> {
    if (redis) {
      try {
        const cached = await redis.get<T>(key);
        if (cached !== null) {
          return cached;
        }
      } catch (err) {
        console.warn(`[cache] getOrSet read failed for key=${key}:`, (err as Error).message);
      }
    }

    const data = await fetcher();

    if (redis) {
      try {
        await redis.set(key, data, { ex: ttlSeconds });
      } catch (err) {
        console.warn(`[cache] getOrSet write failed for key=${key}:`, (err as Error).message);
      }
    }
    return data;
  },
};
