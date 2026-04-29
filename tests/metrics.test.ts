import { describe, it, expect } from 'vitest';
import { betProfit, roi, hitRate, averageOdd, totalProfit } from '@/lib/banca/metrics';
import type { SettledBet } from '@/lib/banca/metrics';

const won: SettledBet = { stake: 100, odd: 2.5, status: 'won' };
const lost: SettledBet = { stake: 100, odd: 2.5, status: 'lost' };
const voided: SettledBet = { stake: 50, odd: 1.8, status: 'void' };
const cashout: SettledBet = { stake: 100, odd: 3.0, status: 'cashout', cashoutAmount: 140 };

describe('betProfit', () => {
  it('won bet: profit = stake × (odd - 1)', () => {
    expect(betProfit(won)).toBeCloseTo(150); // 100 × (2.5 - 1)
  });
  it('lost bet: profit = -stake', () => {
    expect(betProfit(lost)).toBe(-100);
  });
  it('void bet: profit = 0', () => {
    expect(betProfit(voided)).toBe(0);
  });
  it('cashout: profit = cashoutAmount - stake', () => {
    expect(betProfit(cashout)).toBe(40); // 140 - 100
  });
});

describe('roi', () => {
  it('100% ROI on single won bet at 2.0', () => {
    const bet: SettledBet = { stake: 100, odd: 2.0, status: 'won' };
    expect(roi([bet])).toBeCloseTo(100); // profit=100, stake=100 → 100%
  });
  it('-100% ROI on single lost bet', () => {
    expect(roi([lost])).toBeCloseTo(-100);
  });
  it('void bets excluded from ROI calc', () => {
    expect(roi([voided])).toBe(0);
  });
  it('mixed bets: correct ROI', () => {
    // won: +150, lost: -100, total stake: 200 → ROI = 50/200 = 25%
    expect(roi([won, lost])).toBeCloseTo(25);
  });
});

describe('hitRate', () => {
  it('1 win out of 1 → 100%', () => {
    expect(hitRate([won])).toBeCloseTo(1);
  });
  it('1 win out of 2 → 50%', () => {
    expect(hitRate([won, lost])).toBeCloseTo(0.5);
  });
  it('void excluded', () => {
    expect(hitRate([won, voided])).toBeCloseTo(1); // only 1 settled, 1 win
  });
  it('no bets → 0', () => {
    expect(hitRate([])).toBe(0);
  });
});

describe('totalProfit', () => {
  it('sums profits across bets', () => {
    // won +150, lost -100, void 0
    expect(totalProfit([won, lost, voided])).toBeCloseTo(50);
  });
});
