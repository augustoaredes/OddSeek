export type EVBand = 'negative' | 'value' | 'highlight' | 'high';

/** Implied probability from a decimal odd (removes bookmaker payout). */
export function impliedProbability(odd: number): number {
  if (odd <= 1) return 1;
  return 1 / odd;
}

/**
 * Expected Value: how much you gain/lose per unit staked on average.
 * EV > 0 means positive expected value (value bet).
 * @param probability true probability of the outcome (0–1)
 * @param odd decimal odd offered by the bookmaker
 */
export function calculateEV(probability: number, odd: number): number {
  return probability * odd - 1;
}

/** Classify EV into actionable bands. */
export function classifyEV(ev: number): EVBand {
  if (ev <= 0) return 'negative';
  if (ev < 0.05) return 'value';
  if (ev < 0.10) return 'highlight';
  return 'high';
}

/**
 * Format EV as a percentage string with sign, e.g. "+8.3%" or "-2.1%".
 * Guards against NaN, Infinity and values that escaped a probability bug.
 * Valid EV range: −100% to +999% (beyond that it's a data error).
 */
export function formatEV(ev: number, decimals: 0 | 1 = 1): string {
  if (!isFinite(ev) || isNaN(ev) || Math.abs(ev) > 9.99) return ev > 0 ? '>999%' : '—';
  const pct = (ev * 100).toFixed(decimals);
  return ev >= 0 ? `+${pct}%` : `${pct}%`;
}

/** Sanitize an EV value from external/DB sources — returns 0 for corrupted values. */
export function sanitizeEV(ev: number): number {
  if (!isFinite(ev) || isNaN(ev) || Math.abs(ev) > 9.99) return 0;
  return ev;
}
