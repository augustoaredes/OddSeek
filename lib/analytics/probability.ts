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
 * Consensus probability: simple average of devigorized probabilities across multiple books.
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

/**
 * Weighted consensus probability — books with lower overround (more efficient/sharper)
 * receive higher weight. This approximates the OddsJam "sharp book reference" approach
 * for markets where Pinnacle is unavailable (e.g. Brazil).
 *
 * Weight = 1 / overround  →  a 4% margin book gets ~2.5× weight over a 10% margin book.
 *
 * @param oddsPerBook array of odds arrays, one per bookmaker (all outcomes per book)
 * @param selectionIndex which outcome index to compute probability for
 */
export function weightedConsensusProbability(
  oddsPerBook: number[][],
  selectionIndex: number,
): number {
  if (oddsPerBook.length === 0) return 0;

  const items = oddsPerBook
    .filter((odds) => odds.length > selectionIndex && odds[selectionIndex] > 1)
    .map((odds) => {
      const implied = odds.map((o) => 1 / o);
      const overround = implied.reduce((a, b) => a + b, 0);
      if (!isFinite(overround) || overround <= 0) return null;
      const fair = devigorize(odds);
      const prob = fair[selectionIndex];
      if (!isFinite(prob)) return null;
      // Weight inversely proportional to margin (lower margin = sharper book = higher weight)
      const weight = 1 / overround;
      return { prob, weight };
    })
    .filter((x): x is { prob: number; weight: number } => x !== null);

  if (items.length === 0) return 0;

  const sumWeights = items.reduce((s, x) => s + x.weight, 0);
  if (sumWeights === 0) return 0;

  const weighted = items.reduce((s, x) => s + x.prob * x.weight, 0) / sumWeights;
  return Math.max(0, Math.min(1, isFinite(weighted) ? weighted : 0));
}

/** Sharpen consensus probability by a kappa factor (pulls toward 0.5 for caution). */
export function sharpen(probability: number, kappa = 0.95): number {
  return Math.min(1, Math.max(0, probability * kappa));
}
