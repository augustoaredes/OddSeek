import { betProfit } from './metrics';
import type { SettledBet } from './metrics';

export interface BankBet {
  id: string;
  sport: string;
  league: string;
  matchLabel: string;
  market: string;
  selection: string;
  book: string;
  odd: number;
  stake: number;
  status: 'won' | 'lost' | 'pending' | 'void' | 'cashout';
  /** Pre-computed profit for settled bets (optional — can be derived) */
  profit?: number;
  cashoutAmount?: number;
  placedAt: string;
  settledAt?: string;
  source: 'manual' | 'tip' | 'parlay';
}

/** Convert a BankBet to SettledBet for metrics calculations (skip pending) */
export function toSettledBet(b: BankBet): SettledBet | null {
  if (b.status === 'pending') return null;
  return {
    stake: b.stake,
    odd: b.odd,
    status: b.status as SettledBet['status'],
    cashoutAmount: b.cashoutAmount,
  };
}

const now = Date.now();
const d = (days: number) => new Date(now - days * 86_400_000).toISOString();

export const DEMO_BETS: BankBet[] = [
  { id:'b01', sport:'football',   league:'Champions League',  matchLabel:'Real Madrid vs Bayern',   market:'Resultado',   selection:'Real Madrid', book:'Bet365',      odd:2.10, stake:50,  status:'won',     profit:55,   placedAt:d(30), settledAt:d(29), source:'tip' },
  { id:'b02', sport:'football',   league:'Brasileirão A',     matchLabel:'Flamengo vs Palmeiras',   market:'Resultado',   selection:'Flamengo',    book:'Betano',      odd:2.35, stake:40,  status:'won',     profit:54,   placedAt:d(29), settledAt:d(28), source:'tip' },
  { id:'b03', sport:'basketball', league:'NBA',               matchLabel:'Lakers vs Warriors',      market:'Vencedor',    selection:'Lakers',      book:'Stake',       odd:2.00, stake:30,  status:'lost',    profit:-30,  placedAt:d(28), settledAt:d(27), source:'manual' },
  { id:'b04', sport:'football',   league:'Premier League',    matchLabel:'City vs Arsenal',         market:'Resultado',   selection:'Man City',    book:'Sportingbet', odd:1.90, stake:60,  status:'won',     profit:54,   placedAt:d(27), settledAt:d(26), source:'tip' },
  { id:'b05', sport:'tennis',     league:'Roland Garros',     matchLabel:'Djokovic vs Medvedev',    market:'Vencedor',    selection:'Djokovic',    book:'Pinnacle',    odd:1.75, stake:50,  status:'won',     profit:37.5, placedAt:d(26), settledAt:d(25), source:'tip' },
  { id:'b06', sport:'mma',        league:'UFC 298',           matchLabel:'Poirier vs Saint Denis',  market:'Vencedor',    selection:'Poirier',     book:'Bet365',      odd:2.20, stake:40,  status:'lost',    profit:-40,  placedAt:d(25), settledAt:d(24), source:'manual' },
  { id:'b07', sport:'football',   league:'La Liga',           matchLabel:'Barcelona vs Atlético',   market:'Resultado',   selection:'Barcelona',   book:'Betano',      odd:1.85, stake:70,  status:'won',     profit:59.5, placedAt:d(24), settledAt:d(23), source:'tip' },
  { id:'b08', sport:'basketball', league:'NBA',               matchLabel:'Celtics vs Heat',         market:'Total',       selection:'Over 218.5',  book:'Stake',       odd:1.92, stake:35,  status:'won',     profit:32.2, placedAt:d(23), settledAt:d(22), source:'tip' },
  { id:'b09', sport:'football',   league:'Brasileirão A',     matchLabel:'Santos vs Corinthians',   market:'Resultado',   selection:'Santos',      book:'Sportingbet', odd:2.80, stake:30,  status:'lost',    profit:-30,  placedAt:d(22), settledAt:d(21), source:'manual' },
  { id:'b10', sport:'football',   league:'Champions League',  matchLabel:'PSG vs Dortmund',         market:'Resultado',   selection:'PSG',         book:'Bet365',      odd:1.70, stake:80,  status:'won',     profit:56,   placedAt:d(21), settledAt:d(20), source:'tip' },
  { id:'b11', sport:'tennis',     league:'Wimbledon',         matchLabel:'Alcaraz vs Sinner',       market:'Vencedor',    selection:'Alcaraz',     book:'Pinnacle',    odd:1.82, stake:50,  status:'won',     profit:41,   placedAt:d(20), settledAt:d(19), source:'tip' },
  { id:'b12', sport:'football',   league:'Premier League',    matchLabel:'Chelsea vs Liverpool',    market:'Resultado',   selection:'Liverpool',   book:'Betano',      odd:2.10, stake:45,  status:'lost',    profit:-45,  placedAt:d(19), settledAt:d(18), source:'manual' },
  { id:'b13', sport:'mma',        league:'UFC 299',           matchLabel:"O'Malley vs Yan",        market:'Vencedor',    selection:"O'Malley",    book:'Stake',       odd:1.65, stake:60,  status:'won',     profit:39,   placedAt:d(18), settledAt:d(17), source:'tip' },
  { id:'b14', sport:'football',   league:'Série A',           matchLabel:'Fluminense vs Botafogo',  market:'Ambas Marcam',selection:'Sim',         book:'Sportingbet', odd:1.78, stake:40,  status:'void',    profit:0,    placedAt:d(17), settledAt:d(16), source:'manual' },
  { id:'b15', sport:'basketball', league:'NBA',               matchLabel:'Warriors vs Suns',        market:'Vencedor',    selection:'Warriors',    book:'Bet365',      odd:1.95, stake:50,  status:'won',     profit:47.5, placedAt:d(16), settledAt:d(15), source:'tip' },
  { id:'b16', sport:'football',   league:'Champions League',  matchLabel:'Liverpool vs Inter',      market:'Resultado',   selection:'Liverpool',   book:'Betano',      odd:2.00, stake:55,  status:'won',     profit:55,   placedAt:d(14), settledAt:d(13), source:'tip' },
  { id:'b17', sport:'football',   league:'La Liga',           matchLabel:'Real Madrid vs Bilbao',   market:'Handicap',    selection:'RM -1',       book:'Pinnacle',    odd:2.08, stake:40,  status:'lost',    profit:-40,  placedAt:d(12), settledAt:d(11), source:'tip' },
  { id:'b18', sport:'tennis',     league:'US Open',           matchLabel:'Medvedev vs Fritz',       market:'Vencedor',    selection:'Medvedev',    book:'Stake',       odd:1.90, stake:35,  status:'won',     profit:31.5, placedAt:d(10), settledAt:d(9),  source:'tip' },
  { id:'b19', sport:'football',   league:'Série A',           matchLabel:'Grêmio vs Internacional', market:'Resultado',   selection:'Grêmio',      book:'Sportingbet', odd:2.50, stake:30,  status:'lost',    profit:-30,  placedAt:d(8),  settledAt:d(7),  source:'manual' },
  { id:'b20', sport:'basketball', league:'NBA',               matchLabel:'Nuggets vs Clippers',     market:'Vencedor',    selection:'Nuggets',     book:'Bet365',      odd:1.88, stake:60,  status:'won',     profit:52.8, placedAt:d(7),  settledAt:d(6),  source:'tip' },
  { id:'b21', sport:'football',   league:'Premier League',    matchLabel:'Man City vs Spurs',       market:'Resultado',   selection:'Man City',    book:'Betano',      odd:1.65, stake:80,  status:'won',     profit:52,   placedAt:d(5),  settledAt:d(4),  source:'tip' },
  { id:'b22', sport:'mma',        league:'UFC 300',           matchLabel:'Pereira vs Hill',         market:'Vencedor',    selection:'Pereira',     book:'Pinnacle',    odd:1.55, stake:70,  status:'won',     profit:38.5, placedAt:d(4),  settledAt:d(3),  source:'tip' },
  { id:'b23', sport:'football',   league:'Champions League',  matchLabel:'Man City vs Real Madrid', market:'Total',       selection:'Over 2.5',    book:'Stake',       odd:1.85, stake:50,  status:'lost',    profit:-50,  placedAt:d(3),  settledAt:d(2),  source:'manual' },
  { id:'b24', sport:'football',   league:'Série A',           matchLabel:'Flamengo vs Santos',      market:'Resultado',   selection:'Flamengo',    book:'Bet365',      odd:1.80, stake:60,  status:'won',     profit:48,   placedAt:d(2),  settledAt:d(1),  source:'tip' },
  { id:'b25', sport:'basketball', league:'NBA',               matchLabel:'Celtics vs Bucks',        market:'Vencedor',    selection:'Celtics',     book:'Betano',      odd:2.05, stake:40,  status:'pending', profit:0,    placedAt:d(1),  source:'tip' },
  { id:'b26', sport:'football',   league:'Premier League',    matchLabel:'Arsenal vs Chelsea',      market:'Resultado',   selection:'Arsenal',     book:'Sportingbet', odd:2.30, stake:35,  status:'pending', profit:0,    placedAt:d(0),  source:'tip' },
  { id:'b27', sport:'football',   league:'Champions League',  matchLabel:'Real Madrid vs PSG',      market:'Resultado',   selection:'Real Madrid', book:'Bet365',      odd:2.20, stake:55,  status:'pending', profit:0,    placedAt:d(0),  source:'tip' },
];

// Bankroll evolution (14 days)
export function buildEquityCurve(
  bets: BankBet[],
  initial: number,
): Array<{ date: string; balance: number }> {
  const settled = bets
    .filter(b => b.status !== 'pending' && b.settledAt)
    .sort((a, b) => new Date(a.settledAt!).getTime() - new Date(b.settledAt!).getTime());

  const days = 14;
  const points: Array<{ date: string; balance: number }> = [];
  let balance = initial;

  for (let i = days; i >= 0; i--) {
    const day = new Date(Date.now() - i * 86_400_000);
    const dayStr = day.toISOString().slice(0, 10);

    // Sum profits for bets settled on this day
    for (const bet of settled) {
      if (bet.settledAt!.slice(0, 10) === dayStr) {
        const sb = toSettledBet(bet);
        if (sb) balance += betProfit(sb);
      }
    }

    points.push({ date: day.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), balance });
  }

  return points;
}

export const INITIAL_BANKROLL = 2000;
export const DEMO_EQUITY = buildEquityCurve(DEMO_BETS, INITIAL_BANKROLL);
