import { Redis } from '@upstash/redis';

// Vercel Marketplace injects KV_REST_API_* — support both naming conventions
const redisUrl   = process.env.KV_REST_API_URL   ?? process.env.UPSTASH_REDIS_REST_URL   ?? '';
const redisToken = process.env.KV_REST_API_TOKEN  ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? '';
const hasRedis   = redisUrl !== '' && redisToken !== '';

export const redis: Redis | null = hasRedis
  ? new Redis({ url: redisUrl, token: redisToken })
  : null;

// In-memory fallback used when Redis is not configured (dev only)
const memCache = new Map<string, { value: unknown; expiresAt: number }>();

export async function cached<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  if (redis) {
    const hit = await redis.get<T>(key);
    if (hit !== null) return hit;
    const fresh = await fetcher();
    await redis.setex(key, ttlSeconds, JSON.stringify(fresh));
    return fresh;
  }

  // Memory fallback
  const entry = memCache.get(key);
  if (entry && entry.expiresAt > Date.now()) return entry.value as T;
  const fresh = await fetcher();
  memCache.set(key, { value: fresh, expiresAt: Date.now() + ttlSeconds * 1000 });
  return fresh;
}

export async function invalidate(key: string): Promise<void> {
  if (redis) { await redis.del(key); return; }
  memCache.delete(key);
}

export async function invalidatePattern(pattern: string): Promise<void> {
  if (redis) {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) await redis.del(...keys);
    return;
  }
  const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
  for (const key of memCache.keys()) {
    if (regex.test(key)) memCache.delete(key);
  }
}
