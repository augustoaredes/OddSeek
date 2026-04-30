/**
 * OddsPapi adapter — https://oddspapi.io
 *
 * Real API structure (confirmed via exploration):
 *   GET /sports                                            → sportId list
 *   GET /tournaments?sportId=10                            → tournament list per sport
 *   GET /fixtures?tournamentId=325                         → fixture list with team names
 *   GET /odds-by-tournaments?tournamentIds=325&bookmaker=bet365 → odds per bookmaker (ONE at a time)
 *
 * Strategy: fetch fixtures (with names), then fetch odds per bookmaker in parallel,
 * merge by fixtureId, convert to OddsEvent[].
 */

import { consensusProbability } from '@/lib/analytics/probability';
import { calculateEV } from '@/lib/analytics/ev';
import type { OddsEvent, OddsMarket, OddsSelection, BookOdd, Sport, Market } from '../types';

const API_BASE = 'https://api.oddspapi.io/v4';

// Active tournaments (confirmed via /tournaments discovery, April 2026)
const TARGET_TOURNAMENT_IDS = [
  '325',  // Brasileiro Serie A
  '7',    // UEFA Champions League
  '390',  // Brasileiro Serie B
  '373',  // Copa do Brasil
  '384',  // Copa Libertadores
];

// Bookmakers available in OddsPapi with Brazilian coverage (confirmed via API exploration)
// slug → display name
const BOOKMAKER_SLUGS: Record<string, string> = {
  'bet365':           'Bet365',
  'betano':           'Betano',
  'sportingbet':      'Sportingbet',
  'pixbet':           'Pixbet',
  'superbet':         'Superbet',
};

const AFFILIATE_URLS: Record<string, string> = {
  'Bet365':      'https://www.bet365.com/?affid=oddseek_bet365',
  'Betano':      'https://www.betano.com.br/?affid=oddseek_betano',
  'Sportingbet': 'https://www.sportingbet.com.br/?affid=oddseek_sportingbet',
  'Pixbet':      'https://pixbet.com/?affid=oddseek_pixbet',
  'Superbet':    'https://superbet.com.br/?affid=oddseek_superbet',
};

// sportId (from API) → internal Sport
const SPORT_ID_MAP: Record<number, Sport> = {
  10: 'football',
  11: 'basketball',
  12: 'tennis',
  20: 'mma',
};

const MARKET_LABELS: Record<Market, string> = {
  match_winner:  'Resultado Final',
  over_under:    'Total de Gols/Pontos',
  handicap:      'Handicap',
  btts:          'Ambas Marcam',
  double_chance: 'Dupla Hipótese',
};

// OddsPapi market IDs → internal Market type
// Market 101 = Full Time Result (1x2), 104 = BTTS, 106+ = Over/Under totals
const MARKET_ID_MAP: Record<number, Market> = {
  101: 'match_winner',
  104: 'btts',
  106: 'over_under',
  108: 'over_under',
  110: 'over_under',
  112: 'over_under',
  114: 'over_under',
};

// Outcome IDs for market 101 (1x2)
const OUTCOME_LABELS: Record<number, string> = {
  101: '1 (Casa)',
  102: 'X (Empate)',
  103: '2 (Fora)',
  104: 'Sim',  // BTTS yes
  105: 'Não',  // BTTS no
  106: 'Mais de',
  107: 'Menos de',
  108: 'Mais de',
  109: 'Menos de',
  110: 'Mais de',
  111: 'Menos de',
  112: 'Mais de',
  113: 'Menos de',
  114: 'Mais de',
  115: 'Menos de',
};

// ── Raw API types ──────────────────────────────────────────────────────────────

interface ApiFixture {
  fixtureId: string;
  participant1Id: number;
  participant2Id: number;
  participant1Name?: string;
  participant1ShortName?: string;
  participant2Name?: string;
  participant2ShortName?: string;
  sportId: number;
  tournamentId: number;
  tournamentName?: string;
  startTime: string;
  statusId: number;  // 0=scheduled, 1=live, 2=finished, etc.
}

interface ApiOddsPlayer {
  price: number;
  active: boolean;
  mainLine?: boolean;
}

interface ApiOddsOutcomeEntry {
  players: Record<string, ApiOddsPlayer>;
}

interface ApiOddsMarket {
  marketActive: boolean;
  outcomes: Record<string, ApiOddsOutcomeEntry>;
}

interface ApiBookmakerData {
  bookmakerIsActive: boolean;
  suspended: boolean;
  markets: Record<string, ApiOddsMarket>;
}

interface ApiOddsFixture {
  fixtureId: string;
  participant1Id: number;
  participant2Id: number;
  sportId: number;
  tournamentId: number;
  startTime: string;
  statusId: number;
  bookmakerOdds: Record<string, ApiBookmakerData>;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function statusFromId(id: number): 'scheduled' | 'live' | 'finished' {
  if (id === 0) return 'scheduled';
  if (id >= 1 && id <= 9) return 'live';
  return 'finished';
}

function getPrice(entry: ApiOddsOutcomeEntry): number {
  const players = Object.values(entry.players ?? {});
  const main = players.find(p => p.mainLine) ?? players[0];
  return main?.active ? main.price : 0;
}

// ── Build OddsMarket from per-bookmaker odds ───────────────────────────────────

interface BookmakerMarketOdds {
  bookName: string;
  // outcome ID → price
  outcomes: Record<number, number>;
}

function buildMarketFromId(
  marketId: number,
  outcomeIds: number[],
  bookmakerData: BookmakerMarketOdds[],
): OddsMarket | null {
  const marketKey = MARKET_ID_MAP[marketId];
  if (!marketKey) return null;
  if (outcomeIds.length < 2) return null;

  // Build odds matrix [bookmakers × outcomes]
  const validBooks = bookmakerData.filter(b =>
    outcomeIds.every(id => (b.outcomes[id] ?? 0) > 1)
  );
  if (validBooks.length < 1) return null;

  const oddsMatrix = validBooks.map(b => outcomeIds.map(id => b.outcomes[id] ?? 0));

  const selections: OddsSelection[] = outcomeIds.map((outcomeId, idx) => {
    const label = OUTCOME_LABELS[outcomeId] ?? `Outcome ${outcomeId}`;
    const consensusProb = consensusProbability(oddsMatrix, idx);

    let bestOdd = 0;
    let bestBook = '';
    const books: BookOdd[] = validBooks.map(b => {
      const odd = b.outcomes[outcomeId] ?? 0;
      if (odd > bestOdd) { bestOdd = odd; bestBook = b.bookName; }
      return {
        book:        b.bookName,
        odd,
        impliedProb: odd > 0 ? 1 / odd : 0,
        ev:          odd > 0 ? calculateEV(consensusProb, odd) : -1,
        isBest:      false,
        affiliateUrl: AFFILIATE_URLS[b.bookName] ?? '#',
      };
    }).filter(b => b.odd > 1);

    books.forEach(b => { b.isBest = b.book === bestBook; });
    return { label, books, consensusProb, bestOdd, bestBook };
  });

  return { market: marketKey, label: MARKET_LABELS[marketKey], selections };
}

// ── Core fetch helpers ─────────────────────────────────────────────────────────

async function fetchFixtures(apiKey: string, tournamentId: string): Promise<ApiFixture[]> {
  const url = `${API_BASE}/fixtures?apiKey=${apiKey}&tournamentId=${tournamentId}&hasOdds=true`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) {
    console.error(`[oddspapi] fixtures HTTP ${res.status} for tournament ${tournamentId}`);
    return [];
  }
  const data = await res.json();
  return Array.isArray(data) ? data : (data.data ?? []);
}

async function fetchOddsForBookmaker(
  apiKey: string,
  slug: string,
  tournamentIds: string,
): Promise<ApiOddsFixture[]> {
  const url = `${API_BASE}/odds-by-tournaments?apiKey=${apiKey}&tournamentIds=${tournamentIds}&bookmaker=${slug}&oddsFormat=decimal`;
  try {
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) {
      console.error(`[oddspapi] odds HTTP ${res.status} for bookmaker ${slug}`);
      return [];
    }
    const data = await res.json();
    return Array.isArray(data) ? data : (data.data ?? []);
  } catch (err) {
    console.error(`[oddspapi] odds fetch error for ${slug}:`, err);
    return [];
  }
}

// ── Convert merged data to OddsEvent ──────────────────────────────────────────

function convertToOddsEvent(
  fixture: ApiFixture,
  oddsPerBook: Map<string, ApiOddsFixture>,
): OddsEvent | null {
  const home = fixture.participant1ShortName ?? fixture.participant1Name;
  const away = fixture.participant2ShortName ?? fixture.participant2Name;
  if (!home || !away) return null;

  const sport: Sport = SPORT_ID_MAP[fixture.sportId] ?? 'football';

  // Collect all market IDs across all bookmakers
  const marketOutcomeMap = new Map<number, Set<number>>();
  for (const [slug, oddsFixture] of oddsPerBook) {
    const bookData = oddsFixture.bookmakerOdds[slug];
    if (!bookData?.bookmakerIsActive || bookData.suspended) continue;
    for (const [mktIdStr, mkt] of Object.entries(bookData.markets)) {
      const mktId = Number(mktIdStr);
      if (!MARKET_ID_MAP[mktId]) continue;
      if (!mkt.marketActive) continue;
      if (!marketOutcomeMap.has(mktId)) marketOutcomeMap.set(mktId, new Set());
      for (const outcomeId of Object.keys(mkt.outcomes)) {
        marketOutcomeMap.get(mktId)!.add(Number(outcomeId));
      }
    }
  }

  const markets: OddsMarket[] = [];

  for (const [mktId, outcomeSet] of marketOutcomeMap) {
    const outcomeIds = [...outcomeSet].sort((a, b) => a - b);

    const bookmakerData: BookmakerMarketOdds[] = [];
    for (const [slug, displayName] of Object.entries(BOOKMAKER_SLUGS)) {
      const oddsFixture = oddsPerBook.get(slug);
      if (!oddsFixture) continue;
      const bookData = oddsFixture.bookmakerOdds[slug];
      if (!bookData?.bookmakerIsActive || bookData.suspended) continue;
      const mkt = bookData.markets[String(mktId)];
      if (!mkt?.marketActive) continue;

      const outcomes: Record<number, number> = {};
      for (const [outcomeIdStr, entry] of Object.entries(mkt.outcomes)) {
        outcomes[Number(outcomeIdStr)] = getPrice(entry);
      }
      bookmakerData.push({ bookName: displayName, outcomes });
    }

    const market = buildMarketFromId(mktId, outcomeIds, bookmakerData);
    if (market) markets.push(market);
  }

  if (markets.length === 0) return null;

  return {
    id:       fixture.fixtureId,
    sport,
    league:   fixture.tournamentName ?? 'Desconhecido',
    home,
    away,
    startsAt: fixture.startTime,
    status:   statusFromId(fixture.statusId),
    markets,
  };
}

// ── Public API ─────────────────────────────────────────────────────────────────

export async function fetchAllOddsOddsPapi(apiKey: string): Promise<OddsEvent[]> {
  const tournamentIds = TARGET_TOURNAMENT_IDS.join(',');

  // Step 1: fetch fixture metadata (with team names) for each tournament in parallel
  const fixtureArrays = await Promise.all(
    TARGET_TOURNAMENT_IDS.map(tid => fetchFixtures(apiKey, tid))
  );
  const fixtureMap = new Map<string, ApiFixture>();
  for (const arr of fixtureArrays) {
    for (const f of arr) {
      fixtureMap.set(f.fixtureId, f);
    }
  }

  if (fixtureMap.size === 0) return [];

  // Step 2: fetch odds per bookmaker in parallel (API requires one bookmaker at a time)
  const slugs = Object.keys(BOOKMAKER_SLUGS);
  const oddsArrays = await Promise.all(
    slugs.map(slug => fetchOddsForBookmaker(apiKey, slug, tournamentIds))
  );

  // Step 3: index odds by fixtureId → bookmaker slug
  // fixtureId → slug → ApiOddsFixture
  const oddsIndex = new Map<string, Map<string, ApiOddsFixture>>();
  for (let i = 0; i < slugs.length; i++) {
    const slug = slugs[i];
    for (const f of oddsArrays[i]) {
      if (!oddsIndex.has(f.fixtureId)) oddsIndex.set(f.fixtureId, new Map());
      oddsIndex.get(f.fixtureId)!.set(slug, f);
    }
  }

  // Step 4: convert each fixture that has at least 1 bookmaker
  const events: OddsEvent[] = [];
  for (const [fixtureId, fixture] of fixtureMap) {
    const oddsPerBook = oddsIndex.get(fixtureId) ?? new Map();
    if (oddsPerBook.size === 0) continue;
    const event = convertToOddsEvent(fixture, oddsPerBook);
    if (event) events.push(event);
  }

  // Sort: live first, then chronological
  return events.sort((a, b) => {
    if (a.status === 'live' && b.status !== 'live') return -1;
    if (b.status === 'live' && a.status !== 'live') return 1;
    return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
  });
}

/** List sports available in the API */
export async function discoverTournaments(apiKey: string) {
  const res = await fetch(`${API_BASE}/sports?apiKey=${apiKey}`, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`ODDSPAPI /sports: HTTP ${res.status}`);
  return res.json();
}
