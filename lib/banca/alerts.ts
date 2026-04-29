import { betProfit, type SettledBet } from './metrics';

export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface BancaAlert {
  kind: string;
  severity: AlertSeverity;
  message: string;
}

/**
 * Analyze recent bets and bankroll state to produce actionable risk alerts.
 */
export function generateAlerts(
  bets: SettledBet[],
  bankroll: number,
  initialBankroll: number,
  suggestedStake: number,
): BancaAlert[] {
  const alerts: BancaAlert[] = [];
  const settled = bets.filter((b) => b.status !== 'void');

  // 3+ consecutive losses
  let streak = 0;
  for (let i = settled.length - 1; i >= 0; i--) {
    if (settled[i].status === 'lost') {
      streak++;
    } else {
      break;
    }
  }
  if (streak >= 3) {
    alerts.push({
      kind: 'consecutive_losses',
      severity: 'warning',
      message: `${streak} derrotas consecutivas. Considere reduzir stakes ou pausar.`,
    });
  }

  // Stake > 2× suggested
  const lastBet = bets[bets.length - 1];
  if (lastBet && suggestedStake > 0 && lastBet.stake > suggestedStake * 2) {
    alerts.push({
      kind: 'oversize_stake',
      severity: 'warning',
      message: `Stake registrado (R$${lastBet.stake}) é maior que o dobro do sugerido (R$${suggestedStake.toFixed(0)}).`,
    });
  }

  // Daily drawdown ≥ 10% (approximate: last bet loss as % of bankroll)
  const todayLosses = bets
    .filter((b) => b.status === 'lost')
    .reduce((a, b) => a - b.stake, 0);
  const dailyDrawdown = Math.abs(todayLosses) / (bankroll || 1);
  if (dailyDrawdown >= 0.10) {
    alerts.push({
      kind: 'daily_drawdown',
      severity: 'warning',
      message: `Drawdown diário de ${(dailyDrawdown * 100).toFixed(1)}% atingido. Limite diário recomendado: 10%.`,
    });
  }

  // Bankroll < 50% of initial
  if (initialBankroll > 0 && bankroll < initialBankroll * 0.5) {
    alerts.push({
      kind: 'bankroll_critical',
      severity: 'critical',
      message: `Banca abaixo de 50% do valor inicial. Reavalie sua estratégia.`,
    });
  }

  return alerts;
}
