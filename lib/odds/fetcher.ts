/**
 * Unified odds fetcher.
 *
 * Priority:
 *   1. ODDSPAPI_KEY  → OddsPapi (preferred, Brazilian bookmakers)
 *   2. ODDS_API_KEY  → The Odds API (fallback)
 *   3. Mock data     → static seed data
 *
 * Redis cache TTL: 5 min for live data.
 */

import { redis } from '@/lib/redis';
import { MOCK_EVENTS, getEventById as getMockEventById } from './mock-data';
import { fetchAllOdds } from './adapters/the-odds-api';
import { fetchAllOddsOddsPapi } from './adapters/oddspapi';
import type { OddsEvent } from './types';

const CACHE_KEY = 'odds:live:all';
const CACHE_TTL = 300; // 5 minutes

async function getLiveEvents(): Promise<OddsEvent[]> {
  const oddsPapiKey = process.env.ODDSPAPI_KEY;
  const theOddsKey  = process.env.ODDS_API_KEY;

  if (!oddsPapiKey && !theOddsKey) return MOCK_EVENTS;

  // Try Redis cache first
  if (redis) {
    const cached = await redis.get<OddsEvent[]>(CACHE_KEY);
    if (cached) return cached;
  }

  try {
    let events: OddsEvent[] = [];

    if (oddsPapiKey) {
      events = await fetchAllOddsOddsPapi(oddsPapiKey);
      if (events.length === 0 && theOddsKey) {
        console.warn('[odds/fetcher] OddsPapi returned 0 events, falling back to The Odds API');
        events = await fetchAllOdds(theOddsKey);
      }
    } else if (theOddsKey) {
      events = await fetchAllOdds(theOddsKey);
    }

    if (events.length === 0) {
      console.warn('[odds/fetcher] all APIs returned 0 events, using mock data');
      return MOCK_EVENTS;
    }

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
  return Boolean(process.env.ODDSPAPI_KEY ?? process.env.ODDS_API_KEY);
}
