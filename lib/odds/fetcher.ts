/**
 * Unified odds fetcher.
 *
 * Set ODDS_API_KEY in env to use live data.
 * Falls back to mock data when key is absent or on error.
 *
 * Redis cache TTL:
 *   - Live data:  5 min  (preserves free quota, ~288 req/day for 5 sports)
 *   - Mock data:  no cache needed (static)
 */

import { redis } from '@/lib/redis';
import { MOCK_EVENTS, getEventById as getMockEventById } from './mock-data';
import { fetchAllOdds } from './adapters/the-odds-api';
import type { OddsEvent } from './types';

const CACHE_KEY = 'odds:live:all';
const CACHE_TTL = 300; // 5 minutes

async function getLiveEvents(): Promise<OddsEvent[]> {
  const apiKey = process.env.ODDS_API_KEY;
  if (!apiKey) return MOCK_EVENTS;

  // Try Redis cache first
  if (redis) {
    const cached = await redis.get<OddsEvent[]>(CACHE_KEY);
    if (cached) return cached;
  }

  try {
    const events = await fetchAllOdds(apiKey);
    if (events.length === 0) {
      // API returned nothing — fallback to mock to avoid empty page
      return MOCK_EVENTS;
    }
    // Persist in Redis
    if (redis) {
      await redis.set(CACHE_KEY, events, { ex: CACHE_TTL });
    }
    return events;
  } catch (err) {
    console.error('[odds/fetcher] live fetch failed, using mock:', err);
    return MOCK_EVENTS;
  }
}

/** Returns all events (live or mock, cached). */
export async function getEvents(): Promise<OddsEvent[]> {
  return getLiveEvents();
}

/** Returns a single event by id. */
export async function getEventById(id: string): Promise<OddsEvent | undefined> {
  const events = await getLiveEvents();
  return events.find(e => e.id === id) ?? getMockEventById(id);
}

/** Whether we are using live data right now. */
export function isLiveMode(): boolean {
  return Boolean(process.env.ODDS_API_KEY);
}
