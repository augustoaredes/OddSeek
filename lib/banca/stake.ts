export type RiskProfile = 'conservador' | 'moderado' | 'agressivo';

const MAX_STAKE_FRACTION: Record<RiskProfile, number> = {
  conservador: 0.01,  // max 1% of bankroll
  moderado:    0.03,  // max 3%
  agressivo:   0.05,  // max 5%
};

/**
 * Kelly fraction: optimal stake fraction based on edge and odds.
 * @param p true probability of winning
 * @param b net fractional gain (odd - 1)
 */
export function kellyFraction(p: number, b: number): number {
  if (b <= 0 || p <= 0 || p >= 1) return 0;
  return (p * b - (1 - p)) / b;
}

/**
 * Suggested stake using half-Kelly with a per-profile cap.
 * Returns 0 if EV is negative or probability is invalid.
 *
 * @param bankroll current bankroll in R$
 * @param profile user's risk profile
 * @param probability true win probability (0–1)
 * @param odd decimal odd offered
 */
export function suggestedStake(
  bankroll: number,
  profile: RiskProfile,
  probability: number,
  odd: number,
): number {
  if (bankroll <= 0 || probability <= 0 || probability >= 1 || odd <= 1) return 0;

  const b = odd - 1;
  const kelly = kellyFraction(probability, b);
  if (kelly <= 0) return 0;

  const halfKelly = kelly * 0.5;
  const cap = MAX_STAKE_FRACTION[profile];
  const fraction = Math.min(halfKelly, cap);

  return Math.max(0, parseFloat((bankroll * fraction).toFixed(2)));
}

/** Suggested unit size (percentage of bankroll) as a label string. */
export function unitLabel(bankroll: number, profile: RiskProfile): string {
  const cap = MAX_STAKE_FRACTION[profile];
  const unit = bankroll * cap;
  return `R$ ${unit.toFixed(0)}`;
}
