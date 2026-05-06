/**
 * Arbitrage (ARB) calculation engine.
 *
 * An arbitrage opportunity exists when you can bet on ALL outcomes of a market
 * across different bookmakers and guarantee a profit regardless of the result.
 *
 * Condition: Σ (1 / best_odd_per_outcome) < 1
 *
 * ARB% = (1 - Σ(1/best_odd)) × 100   (profit per unit staked)
 *
 * Stake allocation for guaranteed profit:
 *   stake_i = totalStake × (1/odd_i) / Σ(1/odd_j)
 *   return_i = stake_i × odd_i  (same for all i when arb exists)
 */

import type { OddsEvent, OddsMarket, OddsSelection } from '@/lib/odds/types';

export interface ArbLeg {
  /** Selection label (e.g. "Real Madrid") */
  label: string;
  /** Best odd available for this selection */
  odd: number;
  /** Bookmaker offering the best odd */
  book: string;
  /** Affiliate URL for redirect */
  affiliateUrl: string;
  /** Implied probability (1/odd) */
  impliedProb: number;
  /** Stake proportion for guaranteed profit (fraction of total stake) */
  stakeFraction: number;
}

export interface ArbOpportunity {
  eventId: string;
  eventLabel: string;
  league: string;
  sport: string;
  startsAt: string;
  status: 'scheduled' | 'live' | 'finished';
  market: string;
  marketLabel: string;
  /** Sum of implied probabilities across all legs (< 1 means arb exists) */
  impliedSum: number;
  /** ARB percentage: guaranteed profit per unit staked */
  arbPct: number;
  /** Stakes per outcome for R$100 total stake */
  legs: ArbLeg[];
  /** Guaranteed return for R$100 staked */
  guaranteedReturn100: number;
}

/**
 * Detect arbitrage opportunities in a single market.
 * Returns null if no arb exists (impliedSum >= 1).
 */
export function detectArb(
  event: OddsEvent,
  market: OddsMarket,
): ArbOpportunity | null {
  if (market.selections.length < 2) return null;

  const legs: ArbLeg[] = market.selections.map((sel: OddsSelection) => {
    // Find the best odd across all books for this selection
    let bestOdd = 0;
    let bestBook = '';
    let bestUrl = '#';

    for (const b of sel.books) {
      if (b.odd > bestOdd && b.odd > 1.01) {
        bestOdd = b.odd;
        bestBook = b.book;
        bestUrl = b.affiliateUrl;
      }
    }

    return {
      label: sel.label,
      odd: bestOdd,
      book: bestBook,
      affiliateUrl: bestUrl,
      impliedProb: bestOdd > 0 ? 1 / bestOdd : 1,
      stakeFraction: 0, // computed below
    };
  });

  // Filter out legs with no valid odds
  if (legs.some((l) => l.odd <= 1.01)) return null;

  const impliedSum = legs.reduce((s, l) => s + l.impliedProb, 0);
  if (impliedSum >= 1) return null; // No arb

  const arbPct = parseFloat(((1 - impliedSum) * 100).toFixed(3));

  // Distribute R$100 stake proportionally for guaranteed profit
  const totalStake = 100;
  const updatedLegs = legs.map((l) => ({
    ...l,
    stakeFraction: parseFloat((l.impliedProb / impliedSum).toFixed(4)),
  }));

  // Guaranteed return: same for all legs
  const guaranteedReturn100 = parseFloat(
    (totalStake * (1 / impliedSum)).toFixed(2),
  );

  return {
    eventId: event.id,
    eventLabel: `${event.home} vs ${event.away}`,
    league: event.league,
    sport: event.sport,
    startsAt: event.startsAt,
    status: event.status,
    market: market.market,
    marketLabel: market.label,
    impliedSum: parseFloat(impliedSum.toFixed(4)),
    arbPct,
    legs: updatedLegs,
    guaranteedReturn100,
  };
}

/**
 * Scan all events and markets, return sorted ARB opportunities (best first).
 */
export function findAllArb(events: OddsEvent[]): ArbOpportunity[] {
  const results: ArbOpportunity[] = [];

  for (const event of events) {
    for (const market of event.markets) {
      const arb = detectArb(event, market);
      if (arb) results.push(arb);
    }
  }

  // Sort by ARB% descending (best opportunity first)
  return results.sort((a, b) => b.arbPct - a.arbPct);
}

/**
 * Calculate stake for each leg given a desired total stake and the arb legs.
 * Returns { stakes: number[], profit: number }
 */
export function calcArbStakes(
  legs: Pick<ArbLeg, 'odd'>[],
  totalStake: number,
): { stakes: number[]; profit: number } {
  const impliedSum = legs.reduce((s, l) => s + 1 / l.odd, 0);
  if (impliedSum >= 1) return { stakes: legs.map(() => 0), profit: 0 };

  const stakes = legs.map((l) =>
    parseFloat(((totalStake * (1 / l.odd)) / impliedSum).toFixed(2)),
  );
  const profit = parseFloat((totalStake / impliedSum - totalStake).toFixed(2));
  return { stakes, profit };
}
