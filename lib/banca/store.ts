import { DEMO_BETS, INITIAL_BANKROLL, buildEquityCurve, toSettledBet } from './mock-data';
import type { BankBet } from './mock-data';

export type { BankBet };
export { buildEquityCurve, INITIAL_BANKROLL, toSettledBet };

const BETS_KEY    = 'oddseek:banca:bets';
const INITIAL_KEY = 'oddseek:banca:initial';
const PROFILE_KEY = 'oddseek:banca:risk_profile';

export type RiskProfile = 'conservador' | 'moderado' | 'agressivo';

export function loadRiskProfile(): RiskProfile {
  if (typeof window === 'undefined') return 'moderado';
  const raw = localStorage.getItem(PROFILE_KEY) as RiskProfile | null;
  if (raw && ['conservador', 'moderado', 'agressivo'].includes(raw)) return raw;
  return 'moderado';
}

export function saveRiskProfile(profile: RiskProfile): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(PROFILE_KEY, profile);
  }
}

let _idCounter = Date.now();
export function newBetId(): string {
  return `b${(_idCounter++).toString(36)}`;
}

export function loadBets(): BankBet[] {
  if (typeof window === 'undefined') return [...DEMO_BETS];
  try {
    const raw = localStorage.getItem(BETS_KEY);
    if (raw === null) {
      saveBets(DEMO_BETS);
      return [...DEMO_BETS];
    }
    return JSON.parse(raw) as BankBet[];
  } catch {
    return [...DEMO_BETS];
  }
}

export function saveBets(bets: BankBet[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(BETS_KEY, JSON.stringify(bets));
  }
}

export function loadInitialBankroll(): number {
  if (typeof window === 'undefined') return INITIAL_BANKROLL;
  const raw = localStorage.getItem(INITIAL_KEY);
  return raw ? Number(raw) : INITIAL_BANKROLL;
}

export function saveInitialBankroll(amount: number): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(INITIAL_KEY, String(amount));
  }
}
