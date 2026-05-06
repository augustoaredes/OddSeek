/**
 * Tips fetcher — derives tips from live odds when THE_ODDS_API_KEY is set,
 * otherwise uses static mock data.
 *
 * A "tip" is any selection with EV > 0 across all live/scheduled events.
 * Results are cached in Redis for 5 minutes (same TTL as odds cache).
 */

import { getEvents } from '@/lib/odds/fetcher';
import { getDb } from '@/lib/db/client';
import { tips as tipsTable, events as eventsTable } from '@/lib/db/schema';
import { eq, desc, gt } from 'drizzle-orm';
import { AFFILIATE_URLS } from '@/lib/odds/mock-data';
import { MOCK_TIPS } from './mock-data';
import type { Tip, ConfidenceBand } from './mock-data';

const MARKET_LABELS: Record<string, string> = {
  match_winner:    'Resultado Final',
  over_under:      'Total de Gols/Pontos',
  handicap:        'Handicap Asiático',
  btts:            'Ambas Marcam',
  double_chance:   'Dupla Hipótese',
  corners:         'Cantos',
  corner_handicap: 'Handicap de Cantos',
  corners_1h:      'Cantos 1ª Metade',
};

const SPORT_ICONS: Record<string, string> = {
  football:   '⚽',
  basketball: '🏀',
  tennis:     '🎾',
  mma:        '🥊',
  baseball:   '⚾',
  hockey:     '🏒',
};

function confidenceBand(prob: number): ConfidenceBand {
  const pct = prob * 100;
  if (pct >= 75) return 'elite';
  if (pct >= 60) return 'high';
  if (pct >= 45) return 'medium';
  return 'low';
}

async function getTipsFromDB(): Promise<Tip[] | null> {
  try {
    if (!process.env.DATABASE_URL) return null;
    const db = getDb();
    const now = new Date();
    const rows = await db
      .select({
        id:             tipsTable.id,
        eventId:        tipsTable.eventId,
        market:         tipsTable.market,
        selection:      tipsTable.selection,
        book:           tipsTable.book,
        odd:            tipsTable.odd,
        probability:    tipsTable.probability,
        ev:             tipsTable.ev,
        confidenceBand: tipsTable.confidenceBand,
        expiresAt:      tipsTable.expiresAt,
        sport:          eventsTable.sport,
        league:         eventsTable.league,
        home:           eventsTable.home,
        away:           eventsTable.away,
      })
      .from(tipsTable)
      .innerJoin(eventsTable, eq(tipsTable.eventId, eventsTable.id))
      .where(gt(tipsTable.expiresAt, now))
      .orderBy(desc(tipsTable.ev))
      .limit(60);

    if (rows.length === 0) return null;

    const SPORT_ICONS_MAP: Record<string, string> = {
      Futebol: '⚽', Basquete: '🏀', Tênis: '🎾', MMA: '🥊', Vôlei: '🏐', Rugby: '🏉',
    };

    return rows.map(r => ({
      id:             r.id,
      eventId:        r.eventId,
      sport:          r.sport.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''),
      league:         r.league,
      matchLabel:     `${SPORT_ICONS_MAP[r.sport] ?? ''} ${r.home} × ${r.away}`,
      market:         r.market,
      selection:      r.selection,
      book:           r.book,
      odd:            r.odd,
      probability:    r.probability,
      ev:             r.ev,
      evBand:         r.ev >= 0.10 ? 'high' : r.ev >= 0.05 ? 'highlight' : 'value',
      confidence:     Math.round(Math.min(r.probability * 100, 99)),
      confidenceBand: r.confidenceBand as ConfidenceBand,
      expiresAt:      r.expiresAt.toISOString(),
      affiliateUrl:   AFFILIATE_URLS[r.book] ?? '',
    }));
  } catch {
    return null;
  }
}

export async function getTips(): Promise<Tip[]> {
  // Sem chave de API → tenta DB, depois mock
  if (!process.env.ODDS_API_KEY && !process.env.ODDSPAPI_KEY) {
    const dbTips = await getTipsFromDB();
    return dbTips ?? MOCK_TIPS;
  }

  const events = await getEvents();

  const tips: Tip[] = [];

  for (const event of events) {
    const matchLabel = `${SPORT_ICONS[event.sport] ?? ''} ${event.home} × ${event.away}`;
    const expiresAt = event.startsAt;

    for (const market of event.markets) {
      for (const sel of market.selections) {
        // Find the best EV book for this selection
        const bestBook = sel.books.reduce(
          (best, b) => (b.ev > best.ev ? b : best),
          sel.books[0],
        );

        if (!bestBook || bestBook.ev < 0.001) continue; // ignora EV < 0.1%

        tips.push({
          id:             `${event.id}-${market.market}-${sel.label}`,
          eventId:        event.id,
          sport:          event.sport,
          league:         event.league,
          matchLabel,
          market:         MARKET_LABELS[market.market] ?? market.label,
          selection:      sel.label,
          book:           bestBook.book,
          odd:            bestBook.odd,
          probability:    Math.max(0, Math.min(1, isFinite(sel.consensusProb) ? sel.consensusProb : 0)),
          ev:             bestBook.ev,
          evBand:         bestBook.ev >= 0.10 ? 'high' : bestBook.ev >= 0.05 ? 'highlight' : 'value',
          confidence:     Math.round(Math.min(sel.consensusProb * 100, 99)),
          confidenceBand: confidenceBand(sel.consensusProb),
          expiresAt,
          affiliateUrl:   bestBook.affiliateUrl,
        });
      }
    }
  }

  // Sort by EV descending
  return tips.sort((a, b) => b.ev - a.ev);
}
