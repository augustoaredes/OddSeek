import { calculateEV } from '@/lib/analytics/ev';
import type { OddsEvent, OddsListItem, BookOdd, OddsSelection } from './types';

const BOOKS = ['Bet365', 'Betano', 'Sportingbet', 'Pixbet', 'Superbet'];

const AFFILIATE_URLS: Record<string, string> = {
  Bet365:      'https://www.bet365.com/?affid=oddseek_bet365',
  Betano:      'https://www.betano.com.br/?affid=oddseek_betano',
  Sportingbet: 'https://www.sportingbet.com.br/?affid=oddseek_sportingbet',
  Pixbet:      'https://pixbet.com/?affid=oddseek_pixbet',
  Superbet:    'https://superbet.com.br/?affid=oddseek_superbet',
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
          // Pixbet outlier: 2.38 vs consensus ~2.00 → EV +14%
          buildSelection('Real Madrid', [1.98, 2.00, 1.96, 2.38, 2.02]),
          buildSelection('Empate',      [3.40, 3.35, 3.42, 3.38, 3.44]),
          buildSelection('PSG',         [3.15, 3.20, 3.12, 3.10, 3.18]),
        ],
      },
      {
        market: 'over_under',
        label: 'Total de Gols',
        selections: [
          // Pixbet outlier: 1.95 → EV +6%
          buildSelection('Mais de 2.5', [1.80, 1.83, 1.78, 1.95, 1.82]),
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
          // Superbet outlier: 2.55 → EV +12%
          buildSelection('Flamengo',  [2.18, 2.20, 2.15, 2.22, 2.55]),
          buildSelection('Empate',    [3.10, 3.15, 3.08, 3.12, 3.10]),
          buildSelection('Palmeiras', [2.90, 2.95, 2.88, 2.92, 2.96]),
        ],
      },
      {
        market: 'btts',
        label: 'Ambas Marcam',
        selections: [
          // Pixbet outlier: 1.90 → EV +8%
          buildSelection('Sim', [1.68, 1.70, 1.67, 1.90, 1.69]),
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
          // Pixbet outlier: 2.10 → EV +12%
          buildSelection('Man City', [1.82, 1.85, 1.80, 2.10, 1.83]),
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
          // Pixbet outlier: 2.15 → EV +10%
          buildSelection('Lakers',  [1.90, 1.92, 1.88, 2.15, 1.91]),
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
          // Pixbet outlier: 1.98 → EV +8%
          buildSelection('Alcaraz',  [1.78, 1.80, 1.76, 1.98, 1.79]),
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
          // Pixbet outlier: 1.75 → EV +12%
          buildSelection('Jones',  [1.52, 1.55, 1.50, 1.75, 1.53]),
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
