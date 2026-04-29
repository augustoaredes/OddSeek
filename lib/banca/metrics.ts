export interface SettledBet {
  stake: number;
  odd: number;
  status: 'won' | 'lost' | 'void' | 'cashout';
  cashoutAmount?: number;
}

/** Net profit/loss for a single bet. */
export function betProfit(bet: SettledBet): number {
  switch (bet.status) {
    case 'won':
      return bet.stake * (bet.odd - 1);
    case 'lost':
      return -bet.stake;
    case 'cashout':
      return (bet.cashoutAmount ?? 0) - bet.stake;
    case 'void':
      return 0;
  }
}

/** Return on Investment as a percentage (sum profit / sum stake × 100). */
export function roi(bets: SettledBet[]): number {
  const settled = bets.filter((b) => b.status !== 'void');
  if (settled.length === 0) return 0;
  const totalStake = settled.reduce((a, b) => a + b.stake, 0);
  if (totalStake === 0) return 0;
  const totalProfit = settled.reduce((a, b) => a + betProfit(b), 0);
  return (totalProfit / totalStake) * 100;
}

/** Win rate: won bets / all settled bets (void excluded). */
export function hitRate(bets: SettledBet[]): number {
  const settled = bets.filter((b) => b.status !== 'void');
  if (settled.length === 0) return 0;
  const wins = settled.filter((b) => b.status === 'won').length;
  return wins / settled.length;
}

/** Average odd of settled bets (void excluded). */
export function averageOdd(bets: SettledBet[]): number {
  const settled = bets.filter((b) => b.status !== 'void');
  if (settled.length === 0) return 0;
  return settled.reduce((a, b) => a + b.odd, 0) / settled.length;
}

/** Total net profit across all bets. */
export function totalProfit(bets: SettledBet[]): number {
  return bets.reduce((a, b) => a + betProfit(b), 0);
}

/** Maximum drawdown: largest peak-to-trough drop in cumulative bankroll. */
export function maxDrawdown(bets: SettledBet[]): number {
  let peak = 0;
  let cumulative = 0;
  let maxDD = 0;
  for (const bet of bets) {
    cumulative += betProfit(bet);
    if (cumulative > peak) peak = cumulative;
    const drawdown = peak - cumulative;
    if (drawdown > maxDD) maxDD = drawdown;
  }
  return maxDD;
}
