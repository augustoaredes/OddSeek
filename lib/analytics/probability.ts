/**
 * Remove bookmaker margin from a set of odds using the Power method.
 * Returns true probabilities that sum to 1.
 */
export function devigorize(odds: number[]): number[] {
  if (odds.length === 0) return [];

  // Single outcome: no margin to remove — return raw implied probability
  if (odds.length === 1) return [1 / odds[0]];

  // Overround: sum of implied probabilities (> 1 due to margin)
  const implied = odds.map((o) => 1 / o);
  const overround = implied.reduce((a, b) => a + b, 0);

  // Power method: find k such that Σ (1/odd)^(1/k) = 1
  // Iteratively solve for k using Newton's method
  let k = 1;
  for (let i = 0; i < 50; i++) {
    const sum = implied.map((p) => Math.pow(p, 1 / k)).reduce((a, b) => a + b, 0);
    const grad = implied
      .map((p) => -Math.log(p) * Math.pow(p, 1 / k) * (1 / (k * k)))
      .reduce((a, b) => a + b, 0);
    const delta = (sum - 1) / grad;
    k = k - delta;
    if (Math.abs(delta) < 1e-10) break;
  }

  return implied.map((p) => Math.pow(p, 1 / k));
}

/**
 * Consensus probability: average devigorized probability across multiple books.
 * @param oddsPerBook array of odds arrays, one per bookmaker
 * @param selectionIndex which selection index to compute consensus for
 */
export function consensusProbability(
  oddsPerBook: number[][],
  selectionIndex: number,
): number {
  if (oddsPerBook.length === 0) return 0;

  const probs = oddsPerBook
    .filter((odds) => odds.length > selectionIndex && odds[selectionIndex] > 1)
    .map((odds) => {
      const fair = devigorize(odds);
      return fair[selectionIndex];
    });

  if (probs.length === 0) return 0;
  const avg = probs.reduce((a, b) => a + b, 0) / probs.length;
  return Math.max(0, Math.min(1, isFinite(avg) ? avg : 0));
}

/** Sharpen consensus probability by a kappa factor (pulls toward 0.5 for caution). */
export function sharpen(probability: number, kappa = 0.95): number {
  return Math.min(1, Math.max(0, probability * kappa));
}
