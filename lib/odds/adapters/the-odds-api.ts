/**
 * The Odds API v4 adapter
 * Docs: https://the-odds-api.com/liveapi/guides/v4/
 *
 * Quota-aware: each sport_key costs 1 request. Cache aggressively.
 * Free plan: ~500 req/month → cache min 10 min in production.
 */

import { consensusProbability } from '@/lib/analytics/probability';
import { calculateEV } from '@/lib/analytics/ev';
import type { OddsEvent, OddsMarket, OddsSelection, BookOdd, Sport, Market } from '../types';

const API_BASE = 'https://api.the-odds-api.com/v4';

// Bookmakers prioritized for Brazilian users — shown first in the table
const PRIORITY_BOOK_KEYS = [
  'bet365',
  'betano',
  'betano_br',
  'superbet',
  'sportingbet',
  'betnacional',
  'esportivabet',
  '1xbet',
  'pinnacle',
  'betfair_ex_eu',
  'betfair_sb_uk',
  'unibet_eu',
];

function sortBookmakers(bookmakers: ApiBookmaker[]): ApiBookmaker[] {
  return [...bookmakers].sort((a, b) => {
    const ia = PRIORITY_BOOK_KEYS.indexOf(a.key);
    const ib = PRIORITY_BOOK_KEYS.indexOf(b.key);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.title.localeCompare(b.title);
  });
}

// Sports to query (keep minimal to preserve free quota)
export const SPORT_KEYS = [
  'soccer_brazil_campeonato',   // Brasileirão Série A
  'soccer_uefa_champs_league',  // Champions League
  'soccer_epl',                 // Premier League
  'basketball_nba',             // NBA
  'mma_mixed_martial_arts',     // UFC / MMA
];

const SPORT_MAP: Record<string, Sport> = {
  soccer_brazil_campeonato:  'football',
  soccer_uefa_champs_league: 'football',
  soccer_epl:                'football',
  soccer_spain_la_liga:      'football',
  soccer_germany_bundesliga: 'football',
  soccer_italy_serie_a:      'football',
  basketball_nba:            'basketball',
  basketball_euroleague:     'basketball',
  tennis_atp_french_open:    'tennis',
  tennis_wta_french_open:    'tennis',
  mma_mixed_martial_arts:    'mma',
};

const LEAGUE_MAP: Record<string, string> = {
  soccer_brazil_campeonato:  'Brasileirão Série A',
  soccer_uefa_champs_league: 'UEFA Champions League',
  soccer_epl:                'Premier League',
  soccer_spain_la_liga:      'La Liga',
  soccer_germany_bundesliga: 'Bundesliga',
  soccer_italy_serie_a:      'Serie A',
  basketball_nba:            'NBA',
  basketball_euroleague:     'EuroLeague',
  tennis_atp_french_open:    'Roland Garros (ATP)',
  tennis_wta_french_open:    'Roland Garros (WTA)',
  mma_mixed_martial_arts:    'UFC / MMA',
};

const MARKET_TYPE_MAP: Record<string, Market> = {
  h2h:     'match_winner',
  totals:  'over_under',
  spreads: 'handicap',
};

const MARKET_LABEL_MAP: Record<string, string> = {
  h2h:     'Resultado Final',
  totals:  'Total de Pontos/Gols',
  spreads: 'Handicap',
};

// Affiliate URLs per bookmaker key
const AFFILIATE_URLS: Record<string, string> = {
  bet365:            'https://www.bet365.com/?affid=oddseek_001',
  betano:            'https://www.betano.com/?affid=oddseek_002',
  pinnacle:          'https://www.pinnacle.com/?affid=oddseek_003',
  unibet_eu:         'https://www.unibet.eu/?affid=oddseek_004',
  betfair_ex_eu:     'https://www.betfair.com/?affid=oddseek_005',
  betfair_sb_uk:     'https://www.betfair.com/?affid=oddseek_005',
  bwin:              'https://www.bwin.com/?affid=oddseek_006',
  betsson:           'https://www.betsson.com/?affid=oddseek_007',
  williamhill:       'https://www.williamhill.com/?affid=oddseek_008',
  bovada:            'https://www.bovada.lv/?affid=oddseek_009',
  draftkings:        'https://www.draftkings.com/?affid=oddseek_010',
  fanduel:           'https://www.fanduel.com/?affid=oddseek_011',
};

// ── Raw API types ─────────────────────────────────────────────────────────────

interface ApiOutcome {
  name: string;
  price: number;
  point?: number;
}

interface ApiMarket {
  key: string;
  last_update: string;
  outcomes: ApiOutcome[];
}

interface ApiBookmaker {
  key: string;
  title: string;
  last_update: string;
  markets: ApiMarket[];
}

interface ApiEvent {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: ApiBookmaker[];
}

// ── Conversion helpers ────────────────────────────────────────────────────────

function outcomeLabel(outcome: ApiOutcome, marketKey: string): string {
  if (marketKey === 'totals') {
    const pt = outcome.point != null ? ` ${outcome.point}` : '';
    return outcome.name === 'Over'
      ? `Mais de${pt}`
      : `Menos de${pt}`;
  }
  if (outcome.name === 'Draw') return 'Empate';
  return outcome.name;
}

function buildMarket(
  marketKey: string,
  bookmakers: ApiBookmaker[],
): OddsMarket | null {
  const marketType = MARKET_TYPE_MAP[marketKey];
  if (!marketType) return null;

  // Collect all bookmakers that have this market
  const booksWithMarket = bookmakers
    .map(bm => ({
      key:   bm.key,
      title: bm.title,
      mkt:   bm.markets.find(m => m.key === marketKey),
    }))
    .filter(x => x.mkt && x.mkt.outcomes.length >= 2);

  if (booksWithMarket.length === 0) return null;

  // Use the first bookmaker's outcomes as the canonical outcome order
  const canonical = booksWithMarket[0].mkt!.outcomes;
  const outcomeCount = canonical.length;

  // Build oddsPerBook matrix: rows = bookmakers, cols = outcomes (by name match)
  const oddsMatrix: number[][] = booksWithMarket.map(({ mkt }) => {
    return canonical.map(ref => {
      const match = mkt!.outcomes.find(o => o.name === ref.name);
      return match ? match.price : 0;
    });
  }).filter(row => row.every(o => o > 1));

  if (oddsMatrix.length === 0) return null;

  // For each selection, compute consensus probability
  const selections: OddsSelection[] = Array.from({ length: outcomeCount }, (_, idx) => {
    const label = outcomeLabel(canonical[idx], marketKey);
    const consensusProb = consensusProbability(oddsMatrix, idx);

    let bestOdd = 0;
    let bestBook = '';

    const books: BookOdd[] = booksWithMarket
      .map(({ key, title, mkt }) => {
        const match = mkt!.outcomes.find(o => o.name === canonical[idx].name);
        const odd = match?.price ?? 0;
        if (odd > bestOdd) { bestOdd = odd; bestBook = title; }
        return {
          book:        title,
          odd,
          impliedProb: odd > 0 ? 1 / odd : 0,
          ev:          odd > 0 ? calculateEV(consensusProb, odd) : -1,
          isBest:      false,
          affiliateUrl: AFFILIATE_URLS[key] ?? `https://www.${key}.com`,
        };
      })
      .filter(b => b.odd > 1);

    books.forEach(b => { b.isBest = b.book === bestBook; });

    return { label, books, consensusProb, bestOdd, bestBook };
  });

  return {
    market: marketType,
    label:  MARKET_LABEL_MAP[marketKey] ?? marketKey,
    selections,
  };
}

function convertEvent(raw: ApiEvent): OddsEvent | null {
  const sport = SPORT_MAP[raw.sport_key];
  if (!sport) return null;
  if (!raw.bookmakers || raw.bookmakers.length === 0) return null;

  // Sort bookmakers: priority (BR-focused) first
  const sortedBooks = sortBookmakers(raw.bookmakers);

  // Determine which market keys are available
  const marketKeys = [...new Set(
    sortedBooks.flatMap(bm => bm.markets.map(m => m.key))
  )].filter(k => MARKET_TYPE_MAP[k]);

  const markets: OddsMarket[] = marketKeys
    .map(key => buildMarket(key, sortedBooks))
    .filter((m): m is OddsMarket => m !== null);

  if (markets.length === 0) return null;

  const now = Date.now();
  const commenceMs = new Date(raw.commence_time).getTime();
  const status = commenceMs <= now ? 'live' : 'scheduled';

  return {
    id:       raw.id,
    sport,
    league:   LEAGUE_MAP[raw.sport_key] ?? raw.sport_title,
    home:     raw.home_team,
    away:     raw.away_team,
    startsAt: raw.commence_time,
    status,
    markets,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function fetchSportOdds(
  apiKey: string,
  sportKey: string,
): Promise<OddsEvent[]> {
  const params = new URLSearchParams({
    apiKey,
    regions: 'eu,uk',
    markets: 'h2h,totals',
    oddsFormat: 'decimal',
  });

  const res = await fetch(
    `${API_BASE}/sports/${sportKey}/odds/?${params}`,
    { next: { revalidate: 0 } }, // disable Next cache; we use Redis
  );

  if (!res.ok) {
    const remaining = res.headers.get('x-requests-remaining');
    if (res.status === 401) throw new Error('THE_ODDS_API: invalid API key');
    if (res.status === 429) throw new Error('THE_ODDS_API: quota exhausted');
    throw new Error(`THE_ODDS_API: HTTP ${res.status} for ${sportKey} (remaining: ${remaining})`);
  }

  const data: ApiEvent[] = await res.json();
  return data
    .map(convertEvent)
    .filter((e): e is OddsEvent => e !== null);
}

export async function fetchAllOdds(apiKey: string): Promise<OddsEvent[]> {
  const results = await Promise.allSettled(
    SPORT_KEYS.map(key => fetchSportOdds(apiKey, key)),
  );

  const events: OddsEvent[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      events.push(...result.value);
    }
    // Silently skip failed sport keys (quota, no data, etc.)
  }

  // Sort: live first, then by start time
  return events.sort((a, b) => {
    if (a.status === 'live' && b.status !== 'live') return -1;
    if (b.status === 'live' && a.status !== 'live') return 1;
    return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
  });
}
