import { getDb } from '@/lib/db/client';
import { tips, events } from '@/lib/db/schema';
import { eq, desc, gt } from 'drizzle-orm';
import { AFFILIATE_URLS } from '@/lib/odds/mock-data';

const SPORT_ICONS: Record<string, string> = {
  Futebol:  '⚽',
  Basquete: '🏀',
  Tênis:    '🎾',
  MMA:      '🥊',
  Vôlei:    '🏐',
  Rugby:    '🏉',
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sport  = searchParams.get('sport');
  const filter = searchParams.get('filter'); // 'ev5' | 'ev10' | 'high_conf'

  const db = getDb();
  const now = new Date();

  const rows = await db
    .select({
      id:             tips.id,
      eventId:        tips.eventId,
      market:         tips.market,
      selection:      tips.selection,
      book:           tips.book,
      odd:            tips.odd,
      probability:    tips.probability,
      ev:             tips.ev,
      confidenceBand: tips.confidenceBand,
      expiresAt:      tips.expiresAt,
      sport:          events.sport,
      league:         events.league,
      home:           events.home,
      away:           events.away,
      startsAt:       events.startsAt,
    })
    .from(tips)
    .innerJoin(events, eq(tips.eventId, events.id))
    .where(gt(tips.expiresAt, now))
    .orderBy(desc(tips.ev))
    .limit(60);

  const result = rows
    .filter(r => {
      if (sport && sport !== 'all' && r.sport.toLowerCase() !== sport) return false;
      if (filter === 'ev5')      return r.ev >= 0.05;
      if (filter === 'ev10')     return r.ev >= 0.10;
      if (filter === 'high_conf') return r.confidenceBand === 'high' || r.confidenceBand === 'highlight';
      return r.ev > 0;
    })
    .map(r => ({
      id:             r.id,
      eventId:        r.eventId,
      sport:          r.sport.toLowerCase().replace(/ê/g, 'e').replace(/ô/g, 'o'),
      league:         r.league,
      matchLabel:     `${SPORT_ICONS[r.sport] ?? ''} ${r.home} × ${r.away}`,
      market:         r.market,
      selection:      r.selection,
      book:           r.book,
      odd:            r.odd,
      probability:    r.probability,
      ev:             r.ev,
      evBand:         r.ev >= 0.10 ? 'high' : r.ev >= 0.05 ? 'highlight' : 'value',
      confidence:     Math.round(Math.min(r.probability * 100, 99)),
      confidenceBand: r.confidenceBand,
      expiresAt:      r.expiresAt,
      affiliateUrl:   (AFFILIATE_URLS as Record<string, string>)[r.book] ?? null,
    }));

  return Response.json(result, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
  });
}
