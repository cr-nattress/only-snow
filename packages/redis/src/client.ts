import { Redis } from '@upstash/redis';

export type RedisClient = Redis;

export function createRedisClient(url?: string, token?: string): RedisClient {
  return new Redis({
    url: url ?? process.env.UPSTASH_REDIS_REST_URL!,
    token: token ?? process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
}

/** Returns a Redis client if credentials are available, null otherwise. */
export function tryCreateRedisClient(url?: string, token?: string): RedisClient | null {
  const resolvedUrl = url ?? process.env.UPSTASH_REDIS_REST_URL;
  const resolvedToken = token ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!resolvedUrl || !resolvedToken) return null;
  return new Redis({ url: resolvedUrl, token: resolvedToken });
}
