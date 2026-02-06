import { createRedisClient, type RedisClient } from '@onlysnow/redis';

let redis: RedisClient | null = null;
let redisChecked = false;

export function getRedis(): RedisClient | null {
  if (!redisChecked) {
    redisChecked = true;
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      redis = createRedisClient();
    } else {
      console.warn('Redis not configured — caching disabled. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to enable.');
    }
  }
  return redis;
}
