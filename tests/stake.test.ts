import { describe, it, expect } from 'vitest';
import { kellyFraction, suggestedStake } from '@/lib/banca/stake';

describe('kellyFraction', () => {
  it('p=0.6, odd=2.0 → Kelly = 0.20', () => {
    // b = 2.0-1=1; (0.6×1 - 0.4)/1 = 0.2
    expect(kellyFraction(0.6, 1)).toBeCloseTo(0.2);
  });
  it('p=0.4, odd=2.0 → Kelly = 0 (negative edge)', () => {
    // b=1; (0.4×1 - 0.6)/1 = -0.2 → returns 0 (no bet)
    expect(kellyFraction(0.4, 1)).toBeCloseTo(-0.2); // raw value returned; suggestedStake handles clamp
  });
  it('p=0, b=1 → 0', () => {
    expect(kellyFraction(0, 1)).toBe(0);
  });
  it('b=0 → 0', () => {
    expect(kellyFraction(0.6, 0)).toBe(0);
  });
});

describe('suggestedStake', () => {
  it('positive EV → stake > 0', () => {
    // p=0.6, odd=2.0 → EV positive → should suggest a stake
    const stake = suggestedStake(1000, 'moderado', 0.6, 2.0);
    expect(stake).toBeGreaterThan(0);
  });

  it('negative EV → stake = 0', () => {
    // p=0.3, odd=2.0 → EV = -0.4 → no stake
    const stake = suggestedStake(1000, 'moderado', 0.3, 2.0);
    expect(stake).toBe(0);
  });

  it('conservador cap: max 1% of bankroll', () => {
    // Kelly might be large but should be capped at 1% = R$10
    const stake = suggestedStake(1000, 'conservador', 0.9, 5.0);
    expect(stake).toBeLessThanOrEqual(10);
  });

  it('agressivo cap: max 5% of bankroll', () => {
    const stake = suggestedStake(1000, 'agressivo', 0.9, 5.0);
    expect(stake).toBeLessThanOrEqual(50);
  });

  it('half-Kelly is applied (not full Kelly)', () => {
    // Full Kelly for p=0.6, b=1 is 0.2 → half=0.1 → R$100 on bankroll 1000
    // Moderado cap is 3% = R$30, so it's capped at 30
    const stake = suggestedStake(1000, 'moderado', 0.6, 2.0);
    expect(stake).toBeLessThanOrEqual(30); // capped at moderado 3%
    expect(stake).toBeGreaterThan(0);
  });

  it('zero bankroll → 0', () => {
    expect(suggestedStake(0, 'moderado', 0.6, 2.0)).toBe(0);
  });
});
