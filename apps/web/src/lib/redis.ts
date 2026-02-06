import { createRedisClient, type RedisClient } from '@onlysnow/redis';

let redis: RedisClient | null = null;

export function getRedis(): RedisClient {
  if (!redis) {
    redis = createRedisClient();
  }
  return redis;
}
