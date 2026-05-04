import { calculateEV, classifyEV } from '@/lib/analytics/ev';

export type ConfidenceBand = 'low' | 'medium' | 'high' | 'elite';

export interface Tip {
  id: string;
  eventId: string;
  sport: string;
  league: string;
  matchLabel: string;
  market: string;
  selection: string;
  book: string;
  odd: number;
  probability: number;
  ev: number;
  evBand: 'negative' | 'value' | 'highlight' | 'high';
  confidence: number; // 0-100
  confidenceBand: ConfidenceBand;
  expiresAt: string;
  affiliateUrl: string;
}

function makeTip(
  id: string,
  eventId: string,
  sport: string,
  league: string,
  matchLabel: string,
  market: string,
  selection: string,
  book: string,
  odd: number,
  probability: number,
): Tip {
  const ev = calculateEV(probability, odd);
  const evBand = classifyEV(ev) as Tip['evBand'];
  const confidence = Math.round(Math.min(probability * 100, 99));
  const confidenceBand: ConfidenceBand =
    confidence >= 75 ? 'elite' :
    confidence >= 60 ? 'high' :
    confidence >= 45 ? 'medium' : 'low';
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * (6 + Math.random() * 40)).toISOString();

  return {
    id, eventId, sport, league, matchLabel, market, selection, book, odd, probability,
    ev, evBand, confidence, confidenceBand, expiresAt,
    affiliateUrl: `https://www.${book.toLowerCase().replace(' ', '')}.com/?affid=oddseek_001`,
  };
}

export const MOCK_TIPS: Tip[] = [
  makeTip('tip-001', 'evt-rm-psg',       'football',   'Champions League', 'Real Madrid vs PSG',
          'Resultado Final', 'Real Madrid', 'Bet365',      2.20, 0.62),
  makeTip('tip-002', 'evt-rm-psg',       'football',   'Champions League', 'Real Madrid vs PSG',
          'Total de Gols',   'Mais de 2.5',  'Superbet',  1.88, 0.60),
  makeTip('tip-003', 'evt-flam-palmeiras','football',  'Brasileirão A',    'Flamengo vs Palmeiras',
          'Resultado Final', 'Flamengo',    'Betano',      2.35, 0.58),
  makeTip('tip-004', 'evt-flam-palmeiras','football',  'Brasileirão A',    'Flamengo vs Palmeiras',
          'Ambas Marcam',    'Sim',          'Bet365',    1.75, 0.65),
  makeTip('tip-005', 'evt-mancity-arsenal','football', 'Premier League',   'Man City vs Arsenal',
          'Resultado Final', 'Man City',    'Sportingbet', 1.90, 0.61),
  makeTip('tip-006', 'evt-mancity-arsenal','football', 'Premier League',   'Man City vs Arsenal',
          'Handicap -1',     'Man City',    'Superbet',    2.08, 0.58),
  makeTip('tip-007', 'evt-lakers-celtics','basketball','NBA',              'Lakers vs Celtics',
          'Vencedor',        'Lakers',       'Pixbet',     2.00, 0.56),
  makeTip('tip-008', 'evt-lakers-celtics','basketball','NBA',              'Lakers vs Celtics',
          'Total Pontos',    'Mais de 218.5','Bet365',    1.92, 0.59),
  makeTip('tip-009', 'evt-djok-alcaraz', 'tennis',    'Roland Garros',    'Djokovic vs Alcaraz',
          'Vencedor',        'Alcaraz',      'Betano',    1.82, 0.63),
  makeTip('tip-010', 'evt-ufc-jones-miocic','mma',    'UFC 300',          'Jones vs Miocic',
          'Vencedor',        'Jones',        'Pixbet',     1.57, 0.72),
  makeTip('tip-011', 'evt-rm-psg',       'football',  'Champions League', 'Real Madrid vs PSG',
          'Resultado Final', 'Empate',       'Superbet',  3.42, 0.24),
  makeTip('tip-012', 'evt-lakers-celtics','basketball','NBA',              'Lakers vs Celtics',
          'Total Pontos',    'Menos de 218.5','Pixbet',   1.95, 0.52),
  makeTip('tip-013', 'evt-rm-psg',        'football', 'Champions League', 'Real Madrid vs PSG',
          'Cantos',          'Mais de 9.5',  'Bet365',  1.90, 0.60),
  makeTip('tip-014', 'evt-flam-palmeiras','football',  'Brasileirão A',   'Flamengo vs Palmeiras',
          'Cantos',          'Menos de 10.5','Betano',  1.85, 0.62),
  makeTip('tip-015', 'evt-mancity-arsenal','football', 'Premier League',  'Man City vs Arsenal',
          'Cantos 1ª Metade','Mais de 4.5',  'Superbet',2.10, 0.57),
  makeTip('tip-016', 'evt-rm-psg',        'football', 'Champions League', 'Real Madrid vs PSG',
          'Cantos',          'Real Madrid',  'Pixbet',   2.25, 0.55),
];

/** Filter tips by EV band and sport */
export function filterTips(tips: Tip[], sport?: string, minEV?: number): Tip[] {
  return tips.filter(t => {
    if (sport && sport !== 'all' && t.sport !== sport) return false;
    if (minEV != null && t.ev < minEV) return false;
    return true;
  });
}
