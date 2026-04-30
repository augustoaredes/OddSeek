import { MOCK_TIPS } from './mock-data';
import { getTips } from './fetcher';
import { analyzeParlayy } from '@/lib/analytics/parlay';
import type { ParlayAnalysis, ParlayLeg } from '@/lib/analytics/parlay';
import type { Tip } from './mock-data';

export interface SuggestedParlay {
  id: string;
  legs: Array<{
    tip: Tip;
    leg: ParlayLeg;
  }>;
  analysis: ParlayAnalysis;
}

/** Build suggested parlays from any array of EV+ tips */
export function buildParlays(tips: Tip[]): SuggestedParlay[] {
  const evPlus = tips.filter(t => t.ev > 0.03).sort((a, b) => b.ev - a.ev);
  if (evPlus.length < 2) return [];

  const parlays: SuggestedParlay[] = [];

  // One best tip per event (avoid same-event legs)
  const uniqueEvents = [...new Set(evPlus.map(t => t.eventId))];
  const topPerEvent = uniqueEvents
    .map(eventId => evPlus.filter(t => t.eventId === eventId)[0])
    .filter(Boolean);

  // 2-leg parlays
  for (let i = 0; i < Math.min(topPerEvent.length - 1, 4); i++) {
    const tipA = topPerEvent[i];
    const tipB = topPerEvent[i + 1];
    const legs: ParlayLeg[] = [
      { probability: Math.min(tipA.probability, 0.90), odd: tipA.odd, eventId: tipA.eventId },
      { probability: Math.min(tipB.probability, 0.90), odd: tipB.odd, eventId: tipB.eventId },
    ];
    const analysis = analyzeParlayy(legs);
    if (analysis.riskLevel !== 'blocked') {
      parlays.push({
        id: `p2-${i}`,
        legs: [{ tip: tipA, leg: legs[0] }, { tip: tipB, leg: legs[1] }],
        analysis,
      });
    }
  }

  // 3-leg parlay
  if (topPerEvent.length >= 3) {
    const [a, b, c] = topPerEvent;
    const legs: ParlayLeg[] = [
      { probability: Math.min(a.probability, 0.90), odd: a.odd, eventId: a.eventId },
      { probability: Math.min(b.probability, 0.90), odd: b.odd, eventId: b.eventId },
      { probability: Math.min(c.probability, 0.90), odd: c.odd, eventId: c.eventId },
    ];
    const analysis = analyzeParlayy(legs);
    if (analysis.riskLevel !== 'blocked') {
      parlays.push({
        id: 'p3-top',
        legs: [{ tip: a, leg: legs[0] }, { tip: b, leg: legs[1] }, { tip: c, leg: legs[2] }],
        analysis,
      });
    }
  }

  return parlays.sort((a, b) => b.analysis.ev - a.analysis.ev);
}

/** Sync version using mock data (kept for backwards compat) */
export function getSuggestedParlays(): SuggestedParlay[] {
  return buildParlays(MOCK_TIPS);
}

/** Async version using live tips when API key is set */
export async function getSuggestedParlaysAsync(): Promise<SuggestedParlay[]> {
  const tips = await getTips();
  return buildParlays(tips);
}
