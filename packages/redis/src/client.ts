import { Redis } from '@upstash/redis';

export type RedisClient = Redis;

export function createRedisClient(url?: string, token?: string): RedisClient {
  return new Redis({
    url: url ?? process.env.UPSTASH_REDIS_REST_URL!,
    token: token ?? process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
}
