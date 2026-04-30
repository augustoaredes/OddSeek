import { calculateEV } from './ev';

export type RiskLevel = 'low' | 'medium' | 'blocked';

export interface ParlayLeg {
  probability: number;
  odd: number;
  eventId?: string; // used to detect same-event conflicts
}

export interface ParlayAnalysis {
  combinedProbability: number;
  parlayOdd: number;
  ev: number;
  riskLevel: RiskLevel;
  sameEventConflict: boolean;
}

/**
 * Combined probability of independent legs (product rule).
 * Returns null if legs share the same event (correlated — invalid parlay).
 */
export function combinedProbability(legs: ParlayLeg[]): number {
  return legs.reduce((acc, leg) => acc * leg.probability, 1);
}

/** Total decimal odd of a parlay (product of individual odds). */
export function parlayOdd(legs: ParlayLeg[]): number {
  return legs.reduce((acc, leg) => acc * leg.odd, 1);
}

/** Detect if any two legs share the same event (correlated, should be blocked). */
export function hasSameEventConflict(legs: ParlayLeg[]): boolean {
  const ids = legs.map((l) => l.eventId).filter(Boolean) as string[];
  return new Set(ids).size < ids.length;
}

/** Full parlay analysis. */
export function analyzeParlayy(legs: ParlayLeg[]): ParlayAnalysis {
  if (legs.length === 0) {
    return { combinedProbability: 0, parlayOdd: 1, ev: -1, riskLevel: 'blocked', sameEventConflict: false };
  }

  // Clamp inputs to valid ranges before computing
  const safelegs = legs.map(l => ({
    ...l,
    probability: Math.max(0, Math.min(1, l.probability || 0)),
    odd: Math.max(1.01, Math.min(1000, l.odd || 1.01)),
  }));

  const sameEventConflict = hasSameEventConflict(safelegs);
  const prob = combinedProbability(safelegs);
  const odd = parlayOdd(safelegs);
  const rawEv = calculateEV(prob, odd);
  // Guard against corrupted probability/odd data producing invalid EV
  const ev = isFinite(rawEv) && Math.abs(rawEv) <= 9.99 ? rawEv : -1;

  let riskLevel: RiskLevel;
  if (sameEventConflict || prob < 0.15 || ev < 0) {
    riskLevel = 'blocked';
  } else if (safelegs.length <= 2 && prob >= 0.40) {
    riskLevel = 'low';
  } else {
    riskLevel = 'medium';
  }

  return { combinedProbability: prob, parlayOdd: odd, ev, riskLevel, sameEventConflict };
}
