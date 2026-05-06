import { calculateEV } from '@/lib/analytics/ev';
import { weightedConsensusProbability } from '@/lib/analytics/probability';
import type { OddsEvent, OddsMarket, OddsListItem, BookOdd, OddsSelection } from './types';

const BOOKS = ['Bet365', 'Betano', 'Sportingbet', 'Pixbet', 'Superbet'];

export const AFFILIATE_URLS: Record<string, string> = {
  Bet365:      'https://www.bet365.com/?affid=oddseek_bet365',
  Betano:      'https://www.betano.com.br/?affid=oddseek_betano',
  Sportingbet: 'https://www.sportingbet.com.br/?affid=oddseek_sportingbet',
  Pixbet:      'https://pixbet.com/?affid=oddseek_pixbet',
  Superbet:    'https://superbet.com.br/?affid=oddseek_superbet',
};

/**
 * Build a full OddsMarket from a matrix of odds.
 *
 * Methodologia idêntica ao OddsJam (adaptada para mercado brasileiro sem Pinnacle):
 *  1. Para cada bookmaker: desvigora o mercado completo (Power method) → prob. justa por outcome
 *  2. Faz média ponderada pelo inverso do overround (books com menor margem pesam mais)
 *  3. EV = prob_justa_consenso × odd_bookmaker - 1
 *
 * @param marketKey  slug do mercado (ex: 'match_winner')
 * @param marketLabel rótulo de exibição
 * @param entries    array de { label, oddsPerBook } — um entry por outcome, odds na mesma ordem de BOOKS
 */
function buildMarket(
  marketKey: string,
  marketLabel: string,
  entries: { label: string; oddsPerBook: number[] }[],
): OddsMarket {
  const numOutcomes = entries.length;
  const numBooks    = BOOKS.length;

  // oddsMatrix[bookIdx] = [odd_outcome0, odd_outcome1, ...]  (para devigorize do mercado completo)
  const oddsMatrix: number[][] = Array.from({ length: numBooks }, (_, bi) =>
    entries.map(e => e.oddsPerBook[bi] ?? 0),
  );

  const selections: OddsSelection[] = entries.map((entry, selIdx) => {
    // Probabilidade justa via consensus ponderado pelo overround de cada book
    const consensusProb = weightedConsensusProbability(oddsMatrix, selIdx);

    let bestOdd  = 0;
    let bestBook = BOOKS[0];

    const books: BookOdd[] = BOOKS.map((book, bi) => {
      const odd = entry.oddsPerBook[bi] ?? 0;
      if (odd > bestOdd) { bestOdd = odd; bestBook = book; }
      return {
        book,
        odd,
        impliedProb: odd > 0 ? 1 / odd : 0,
        ev:          odd > 0 ? calculateEV(consensusProb, odd) : -1,
        isBest:      false,
        affiliateUrl: AFFILIATE_URLS[book],
      };
    });

    books.forEach(b => { b.isBest = b.book === bestBook; });

    return { label: entry.label, books, consensusProb, bestOdd, bestBook };
  });

  return { market: marketKey as OddsMarket['market'], label: marketLabel, selections };
}

// ---------------------------------------------------------------------------
// Mock events — odds construídas com outliers realistas de 1 bookmaker
// Overround típico: Bet365/Betano/Sporting ~7-8%, Pixbet ~4%, Superbet ~6%
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
      // Pixbet outlier: Real Madrid 2.38 vs consenso ~2.00 → EV real ~+5%
      buildMarket('match_winner', 'Resultado Final', [
        { label: 'Real Madrid', oddsPerBook: [1.98, 2.00, 1.96, 2.38, 2.02] },
        { label: 'Empate',      oddsPerBook: [3.40, 3.35, 3.42, 3.38, 3.44] },
        { label: 'PSG',         oddsPerBook: [3.15, 3.20, 3.12, 3.10, 3.18] },
      ]),
      // Pixbet outlier: Over 2.5 a 1.95 vs ~1.80 → EV real ~+4%
      buildMarket('over_under', 'Total de Gols', [
        { label: 'Mais de 2.5',  oddsPerBook: [1.80, 1.83, 1.78, 1.95, 1.82] },
        { label: 'Menos de 2.5', oddsPerBook: [2.05, 2.00, 2.08, 2.02, 2.06] },
      ]),
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
      // Superbet outlier: Flamengo 2.55 vs ~2.20 → EV real ~+7%
      buildMarket('match_winner', 'Resultado Final', [
        { label: 'Flamengo',  oddsPerBook: [2.18, 2.20, 2.15, 2.22, 2.55] },
        { label: 'Empate',    oddsPerBook: [3.10, 3.15, 3.08, 3.12, 3.10] },
        { label: 'Palmeiras', oddsPerBook: [2.90, 2.95, 2.88, 2.92, 2.96] },
      ]),
      // Pixbet outlier: Ambas Marcam Sim a 1.90 vs ~1.68 → EV real ~+5%
      buildMarket('btts', 'Ambas Marcam', [
        { label: 'Sim', oddsPerBook: [1.68, 1.70, 1.67, 1.90, 1.69] },
        { label: 'Não', oddsPerBook: [2.10, 2.05, 2.12, 2.08, 2.06] },
      ]),
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
      // Pixbet outlier: Man City 2.10 vs ~1.82 → EV real ~+7%
      buildMarket('match_winner', 'Resultado Final', [
        { label: 'Man City', oddsPerBook: [1.82, 1.85, 1.80, 2.10, 1.83] },
        { label: 'Empate',   oddsPerBook: [3.60, 3.55, 3.65, 3.58, 3.62] },
        { label: 'Arsenal',  oddsPerBook: [4.20, 4.15, 4.25, 4.18, 4.22] },
      ]),
      buildMarket('handicap', 'Handicap Asiático', [
        { label: 'Man City -1', oddsPerBook: [2.05, 2.08, 2.02, 2.10, 2.06] },
        { label: 'Arsenal +1',  oddsPerBook: [1.88, 1.85, 1.90, 1.86, 1.84] },
      ]),
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
      // Pixbet outlier: Lakers 2.15 vs ~1.90 → EV real ~+5%
      buildMarket('match_winner', 'Vencedor', [
        { label: 'Lakers',  oddsPerBook: [1.90, 1.92, 1.88, 2.15, 1.91] },
        { label: 'Celtics', oddsPerBook: [1.92, 1.90, 1.94, 1.88, 1.92] },
      ]),
      buildMarket('over_under', 'Total de Pontos', [
        { label: 'Mais de 218.5',  oddsPerBook: [1.90, 1.92, 1.88, 1.95, 1.91] },
        { label: 'Menos de 218.5', oddsPerBook: [1.96, 1.94, 1.98, 1.92, 1.95] },
      ]),
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
      // Pixbet outlier: Alcaraz 1.98 vs ~1.78 → EV real ~+4%
      buildMarket('match_winner', 'Vencedor do Jogo', [
        { label: 'Djokovic', oddsPerBook: [2.05, 2.08, 2.02, 2.10, 2.06] },
        { label: 'Alcaraz',  oddsPerBook: [1.78, 1.80, 1.76, 1.98, 1.79] },
      ]),
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
      // Pixbet outlier: Jones 1.75 vs ~1.52 → EV real ~+6%
      buildMarket('match_winner', 'Vencedor', [
        { label: 'Jones',  oddsPerBook: [1.52, 1.55, 1.50, 1.75, 1.53] },
        { label: 'Miocic', oddsPerBook: [2.50, 2.45, 2.55, 2.48, 2.52] },
      ]),
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
