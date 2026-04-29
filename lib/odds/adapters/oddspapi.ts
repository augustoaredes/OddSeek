/**
 * OddsPapi adapter — https://oddspapi.io
 *
 * Auth: ?apiKey=KEY  (query param)
 * Base: https://api.oddspapi.io/v4
 *
 * Flow:
 *   1. GET /tournaments  → list of available sport tournaments
 *   2. GET /odds-by-tournaments?tournamentIds=ID1,ID2  → odds per fixture
 */

import { consensusProbability } from '@/lib/analytics/probability';
import { calculateEV } from '@/lib/analytics/ev';
import type { OddsEvent, OddsMarket, OddsSelection, BookOdd, Sport, Market } from '../types';

const API_BASE = 'https://api.oddspapi.io/v4';

// Only these 6 bookmakers are shown in the app
const ALLOWED_BOOKS = ['Bet365', 'Betano', 'Sportingbet', 'Pixbet', 'Superbet', 'Esportes da Sorte'];

// Affiliate URLs per bookmaker
const AFFILIATE_URLS: Record<string, string> = {
  'Bet365':            'https://www.bet365.com/?affid=oddseek_bet365',
  'Betano':            'https://www.betano.com.br/?affid=oddseek_betano',
  'Sportingbet':       'https://www.sportingbet.com.br/?affid=oddseek_sportingbet',
  'Pixbet':            'https://pixbet.com/?affid=oddseek_pixbet',
  'Superbet':          'https://superbet.com.br/?affid=oddseek_superbet',
  'Esportes da Sorte': 'https://www.esportesdasorte.com.br/?affid=oddseek_edssorte',
};

// Tournament IDs to query (Brazilian + main international leagues)
// Run GET /tournaments once to discover IDs for your account
const TARGET_TOURNAMENT_IDS = [
  '1',   // Brasileirão Série A (adjust IDs after consulting /tournaments)
  '2',   // Champions League
  '3',   // Premier League
  '4',   // La Liga
  '5',   // NBA
  '6',   // UFC / MMA
];

// Map OddsPapi sport names to internal Sport type
const SPORT_MAP: Record<string, Sport> = {
  soccer:     'football',
  football:   'football',
  basketball: 'basketball',
  tennis:     'tennis',
  mma:        'mma',
  volleyball: 'football', // fallback
};

// Map OddsPapi market names to internal Market type
const MARKET_MAP: Record<string, Market> = {
  'match_winner': 'match_winner',
  '1x2':         'match_winner',
  'h2h':         'match_winner',
  'moneyline':   'match_winner',
  'totals':      'over_under',
  'over_under':  'over_under',
  'total':       'over_under',
  'spreads':     'handicap',
  'handicap':    'handicap',
  'btts':        'btts',
  'both_teams_to_score': 'btts',
};

const MARKET_LABELS: Record<Market, string> = {
  match_winner:  'Resultado Final',
  over_under:    'Total de Gols/Pontos',
  handicap:      'Handicap',
  btts:          'Ambas Marcam',
  double_chance: 'Dupla Hipótese',
};

// ── Raw API types ─────────────────────────────────────────────────────────────

interface ApiOddsOutcome {
  name: string;
  odds: number;      // decimal format
  point?: number;    // for totals/handicap
}

interface ApiOddsBookmaker {
  name: string;
  markets: {
    name: string;
    outcomes: ApiOddsOutcome[];
  }[];
}

interface ApiOddsFixture {
  id: string;
  tournament_id: string;
  tournament_name: string;
  sport: string;
  home_team: string;
  away_team: string;
  start_time: string;   // ISO
  status: string;       // "scheduled" | "live" | "finished"
  elapsed?: number;
  bookmakers: ApiOddsBookmaker[];
}

// ── Conversion helpers ────────────────────────────────────────────────────────

function filterBooks(bookmakers: ApiOddsBookmaker[]): ApiOddsBookmaker[] {
  const filtered = bookmakers.filter(b => ALLOWED_BOOKS.includes(b.name));
  // Sort by ALLOWED_BOOKS order
  return filtered.sort((a, b) => ALLOWED_BOOKS.indexOf(a.name) - ALLOWED_BOOKS.indexOf(b.name));
}

function buildMarket(
  marketName: string,
  bookmakers: ApiOddsBookmaker[],
): OddsMarket | null {
  const marketKey = MARKET_MAP[marketName.toLowerCase()];
  if (!marketKey) return null;

  const booksWithMarket = bookmakers
    .map(bm => ({
      name: bm.name,
      mkt: bm.markets.find(m => MARKET_MAP[m.name.toLowerCase()] === marketKey),
    }))
    .filter(x => x.mkt && x.mkt.outcomes.length >= 2);

  if (booksWithMarket.length < 1) return null;

  const canonical = booksWithMarket[0].mkt!.outcomes;
  const outcomeCount = canonical.length;

  // Build odds matrix [bookmakers × outcomes]
  const oddsMatrix: number[][] = booksWithMarket
    .map(({ mkt }) =>
      canonical.map(ref => {
        const match = mkt!.outcomes.find(o => o.name === ref.name);
        return match?.odds ?? 0;
      })
    )
    .filter(row => row.every(o => o > 1));

  if (oddsMatrix.length === 0) return null;

  const selections: OddsSelection[] = Array.from({ length: outcomeCount }, (_, idx) => {
    const outcome = canonical[idx];
    const label = outcome.name === 'Draw' ? 'Empate'
      : outcome.name === 'Over' ? `Mais de ${outcome.point ?? ''}`
      : outcome.name === 'Under' ? `Menos de ${outcome.point ?? ''}`
      : outcome.name;

    const consensusProb = consensusProbability(oddsMatrix, idx);

    let bestOdd = 0;
    let bestBook = '';

    const books: BookOdd[] = booksWithMarket
      .map(({ name, mkt }) => {
        const match = mkt!.outcomes.find(o => o.name === outcome.name);
        const odd = match?.odds ?? 0;
        if (odd > bestOdd) { bestOdd = odd; bestBook = name; }
        return {
          book:        name,
          odd,
          impliedProb: odd > 0 ? 1 / odd : 0,
          ev:          odd > 0 ? calculateEV(consensusProb, odd) : -1,
          isBest:      false,
          affiliateUrl: AFFILIATE_URLS[name] ?? `https://www.${name.toLowerCase().replace(/\s+/g, '')}.com`,
        };
      })
      .filter(b => b.odd > 1);

    books.forEach(b => { b.isBest = b.book === bestBook; });

    return { label, books, consensusProb, bestOdd, bestBook };
  });

  return {
    market: marketKey,
    label:  MARKET_LABELS[marketKey],
    selections,
  };
}

function convertFixture(raw: ApiOddsFixture): OddsEvent | null {
  if (!raw.home_team || !raw.away_team) return null;

  const sport = SPORT_MAP[raw.sport?.toLowerCase()] ?? 'football';
  const allowedBooks = filterBooks(raw.bookmakers ?? []);
  if (allowedBooks.length === 0) return null;

  // Collect unique market names across all bookmakers
  const marketNames = [...new Set(
    allowedBooks.flatMap(bm => bm.markets.map(m => m.name.toLowerCase()))
  )];

  const markets: OddsMarket[] = marketNames
    .map(name => buildMarket(name, allowedBooks))
    .filter((m): m is OddsMarket => m !== null);

  if (markets.length === 0) return null;

  const status = raw.status === 'live' ? 'live'
    : raw.status === 'finished' ? 'finished'
    : 'scheduled';

  return {
    id:       raw.id,
    sport,
    league:   raw.tournament_name ?? 'Desconhecido',
    home:     raw.home_team,
    away:     raw.away_team,
    startsAt: raw.start_time,
    status,
    elapsed:  raw.elapsed,
    markets,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

async function fetchTournaments(apiKey: string): Promise<{ id: string; name: string }[]> {
  const res = await fetch(`${API_BASE}/tournaments?apiKey=${apiKey}`, {
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`ODDSPAPI /tournaments: HTTP ${res.status}`);
  const data = await res.json();
  // Response may be array or { data: [...] }
  return Array.isArray(data) ? data : (data.data ?? []);
}

export async function fetchAllOddsOddsPapi(apiKey: string): Promise<OddsEvent[]> {
  const tournamentIds = TARGET_TOURNAMENT_IDS.join(',');

  const params = new URLSearchParams({
    apiKey,
    tournamentIds,
    oddsFormat: 'decimal',
  });

  const res = await fetch(`${API_BASE}/odds-by-tournaments?${params}`, {
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error('ODDSPAPI: chave de API inválida');
    if (res.status === 429) throw new Error('ODDSPAPI: quota esgotada');
    throw new Error(`ODDSPAPI: HTTP ${res.status}`);
  }

  const data = await res.json();
  const fixtures: ApiOddsFixture[] = Array.isArray(data) ? data : (data.data ?? data.fixtures ?? []);

  const events = fixtures
    .map(convertFixture)
    .filter((e): e is OddsEvent => e !== null);

  // Sort: live first, then chronological
  return events.sort((a, b) => {
    if (a.status === 'live' && b.status !== 'live') return -1;
    if (b.status === 'live' && a.status !== 'live') return 1;
    return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
  });
}

/** Discover available tournament IDs — call once to configure TARGET_TOURNAMENT_IDS */
export async function discoverTournaments(apiKey: string) {
  return fetchTournaments(apiKey);
}
