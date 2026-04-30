import { calculateEV } from '@/lib/analytics/ev';
import type { OddsEvent, OddsListItem, BookOdd, OddsSelection } from './types';

const BOOKS = ['Bet365', 'Betano', 'Sportingbet', 'Stake', 'Pinnacle'];

const AFFILIATE_URLS: Record<string, string> = {
  Bet365:      'https://www.bet365.com/?affid=oddseek_001',
  Betano:      'https://www.betano.com/?affid=oddseek_002',
  Sportingbet: 'https://www.sportingbet.com/?affid=oddseek_003',
  Stake:       'https://stake.com/?affid=oddseek_004',
  Pinnacle:    'https://www.pinnacle.com/?affid=oddseek_005',
};

/** Build an OddsSelection from raw odds arrays per book.
 *  rawOdds: one odd per bookmaker for THIS selection (not the full market).
 *  Use simple average implied probability — devigorize needs the full market. */
function buildSelection(label: string, rawOdds: number[]): OddsSelection {
  const consensusProb = rawOdds.reduce((s, o) => s + 1 / o, 0) / rawOdds.length;

  let bestOdd = 0;
  let bestBook = BOOKS[0];

  const books: BookOdd[] = BOOKS.map((book, i) => {
    const odd = rawOdds[i];
    if (odd > bestOdd) { bestOdd = odd; bestBook = book; }
    return {
      book,
      odd,
      impliedProb: 1 / odd,
      ev: calculateEV(consensusProb, odd),
      isBest: false,
      affiliateUrl: AFFILIATE_URLS[book],
    };
  });

  // Mark best
  books.forEach(b => { b.isBest = b.book === bestBook; });

  return { label, books, consensusProb, bestOdd, bestBook };
}

// ---------------------------------------------------------------------------
// Raw mock events
// ---------------------------------------------------------------------------

export const MOCK_EVENTS: OddsEvent[] = [
  // --- FOOTBALL ---
  {
    id: 'evt-rm-psg',
    sport: 'football',
    league: 'UEFA Champions League',
    home: 'Real Madrid',
    away: 'PSG',
    startsAt: new Date(Date.now() + 1000 * 60 * 90).toISOString(),
    status: 'live',
    elapsed: 67,
    markets: [
      {
        market: 'match_winner',
        label: 'Resultado Final',
        selections: [
          buildSelection('Real Madrid', [2.10, 2.15, 2.08, 2.20, 2.18]),
          buildSelection('Empate',      [3.40, 3.35, 3.45, 3.38, 3.42]),
          buildSelection('PSG',         [3.20, 3.25, 3.18, 3.30, 3.22]),
        ],
      },
      {
        market: 'over_under',
        label: 'Total de Gols',
        selections: [
          buildSelection('Mais de 2.5', [1.82, 1.85, 1.80, 1.88, 1.84]),
          buildSelection('Menos de 2.5',[2.05, 2.00, 2.08, 2.02, 2.06]),
        ],
      },
    ],
  },
  {
    id: 'evt-flam-palmeiras',
    sport: 'football',
    league: 'Brasileirão Série A',
    home: 'Flamengo',
    away: 'Palmeiras',
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString(),
    status: 'scheduled',
    markets: [
      {
        market: 'match_winner',
        label: 'Resultado Final',
        selections: [
          buildSelection('Flamengo',  [2.30, 2.25, 2.35, 2.28, 2.32]),
          buildSelection('Empate',    [3.10, 3.15, 3.08, 3.12, 3.10]),
          buildSelection('Palmeiras', [2.90, 2.95, 2.88, 2.92, 2.96]),
        ],
      },
      {
        market: 'btts',
        label: 'Ambas Marcam',
        selections: [
          buildSelection('Sim', [1.72, 1.75, 1.70, 1.78, 1.74]),
          buildSelection('Não', [2.10, 2.05, 2.12, 2.08, 2.06]),
        ],
      },
    ],
  },
  {
    id: 'evt-mancity-arsenal',
    sport: 'football',
    league: 'Premier League',
    home: 'Manchester City',
    away: 'Arsenal',
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(),
    status: 'scheduled',
    markets: [
      {
        market: 'match_winner',
        label: 'Resultado Final',
        selections: [
          buildSelection('Man City', [1.85, 1.88, 1.82, 1.90, 1.86]),
          buildSelection('Empate',   [3.60, 3.55, 3.65, 3.58, 3.62]),
          buildSelection('Arsenal',  [4.20, 4.15, 4.25, 4.18, 4.22]),
        ],
      },
      {
        market: 'handicap',
        label: 'Handicap Asiático',
        selections: [
          buildSelection('Man City -1',  [2.05, 2.08, 2.02, 2.10, 2.06]),
          buildSelection('Arsenal +1',   [1.88, 1.85, 1.90, 1.86, 1.84]),
        ],
      },
    ],
  },
  // --- BASKETBALL ---
  {
    id: 'evt-lakers-celtics',
    sport: 'basketball',
    league: 'NBA',
    home: 'LA Lakers',
    away: 'Boston Celtics',
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(),
    status: 'scheduled',
    markets: [
      {
        market: 'match_winner',
        label: 'Vencedor',
        selections: [
          buildSelection('Lakers',  [1.95, 1.98, 1.92, 2.00, 1.96]),
          buildSelection('Celtics', [1.92, 1.90, 1.94, 1.88, 1.92]),
        ],
      },
      {
        market: 'over_under',
        label: 'Total de Pontos',
        selections: [
          buildSelection('Mais de 218.5', [1.90, 1.92, 1.88, 1.95, 1.91]),
          buildSelection('Menos de 218.5',[1.96, 1.94, 1.98, 1.92, 1.95]),
        ],
      },
    ],
  },
  // --- TENNIS ---
  {
    id: 'evt-djok-alcaraz',
    sport: 'tennis',
    league: 'Roland Garros',
    home: 'N. Djokovic',
    away: 'C. Alcaraz',
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    status: 'scheduled',
    markets: [
      {
        market: 'match_winner',
        label: 'Vencedor do Jogo',
        selections: [
          buildSelection('Djokovic', [2.05, 2.08, 2.02, 2.10, 2.06]),
          buildSelection('Alcaraz',  [1.82, 1.80, 1.84, 1.78, 1.82]),
        ],
      },
    ],
  },
  // --- MMA ---
  {
    id: 'evt-ufc-jones-miocic',
    sport: 'mma',
    league: 'UFC 300',
    home: 'J. Jones',
    away: 'S. Miocic',
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    status: 'scheduled',
    markets: [
      {
        market: 'match_winner',
        label: 'Vencedor',
        selections: [
          buildSelection('Jones',  [1.55, 1.57, 1.53, 1.60, 1.56]),
          buildSelection('Miocic', [2.50, 2.45, 2.55, 2.48, 2.52]),
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Derived list view (no market detail)
// ---------------------------------------------------------------------------

export const MOCK_EVENTS_LIST: OddsListItem[] = MOCK_EVENTS.map(e => {
  const winnerMarket = e.markets.find(m => m.market === 'match_winner');
  const winner = winnerMarket?.selections[0] ?? null;

  // Best EV across all selections in all markets
  let bestEV = -Infinity;
  for (const market of e.markets) {
    for (const sel of market.selections) {
      for (const b of sel.books) {
        if (b.ev > bestEV) bestEV = b.ev;
      }
    }
  }

  return {
    id: e.id,
    sport: e.sport,
    league: e.league,
    home: e.home,
    away: e.away,
    startsAt: e.startsAt,
    status: e.status,
    elapsed: e.elapsed,
    winner,
    bestEV,
  };
});

export function getEventById(id: string): OddsEvent | undefined {
  return MOCK_EVENTS.find(e => e.id === id);
}
