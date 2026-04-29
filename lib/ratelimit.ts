import { Ratelimit } from '@upstash/ratelimit';
import { redis } from './redis';

type RateLimitResult = { success: boolean; remaining: number; reset: number };

// When Redis is not configured (dev), always allow requests
const devPassthrough = async (): Promise<RateLimitResult> => ({
  success: true,
  remaining: 99,
  reset: Date.now() + 60_000,
});

function makeRatelimit(limit: number, window: string, prefix: string) {
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, window as `${number} ${'ms' | 's' | 'm' | 'h' | 'd'}`),
    prefix,
    analytics: false,
  });
}

export const loginRatelimit    = makeRatelimit(5,  '60 s', 'rl:login');
export const registerRatelimit = makeRatelimit(3,  '60 s', 'rl:register');
export const apiRatelimit      = makeRatelimit(60, '60 s', 'rl:api');
export const affiliateRatelimit = makeRatelimit(30, '60 s', 'rl:affiliate');

export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<RateLimitResult> {
  if (!limiter) return devPassthrough();
  const { success, remaining, reset } = await limiter.limit(identifier);
  return { success, remaining, reset };
}
