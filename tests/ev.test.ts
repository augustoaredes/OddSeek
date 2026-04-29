import { describe, it, expect } from 'vitest';
import { impliedProbability, calculateEV, classifyEV, formatEV } from '@/lib/analytics/ev';

describe('impliedProbability', () => {
  it('converts odd 2.0 → 0.5', () => {
    expect(impliedProbability(2.0)).toBeCloseTo(0.5);
  });
  it('converts odd 1.5 → 0.667', () => {
    expect(impliedProbability(1.5)).toBeCloseTo(0.667, 2);
  });
  it('handles odd ≤ 1 safely', () => {
    expect(impliedProbability(1)).toBe(1);
    expect(impliedProbability(0)).toBe(1);
  });
});

describe('calculateEV', () => {
  it('EV = +0.20 when p=0.6, odd=2.0', () => {
    expect(calculateEV(0.6, 2.0)).toBeCloseTo(0.2);
  });
  it('EV = -0.20 when p=0.4, odd=2.0', () => {
    expect(calculateEV(0.4, 2.0)).toBeCloseTo(-0.2);
  });
  it('EV = 0 when p matches implied probability', () => {
    // implied(2.0) = 0.5, so EV at p=0.5 should be 0
    expect(calculateEV(0.5, 2.0)).toBeCloseTo(0);
  });
  it('handles high odds value bet', () => {
    // p=0.3, odd=4.0 → EV = 0.3*4 - 1 = 0.2
    expect(calculateEV(0.3, 4.0)).toBeCloseTo(0.2);
  });
});

describe('classifyEV', () => {
  it('negative EV → negative', () => expect(classifyEV(-0.05)).toBe('negative'));
  it('zero EV → negative', () => expect(classifyEV(0)).toBe('negative'));
  it('small positive → value', () => expect(classifyEV(0.03)).toBe('value'));
  it('medium positive → highlight', () => expect(classifyEV(0.07)).toBe('highlight'));
  it('high positive → high', () => expect(classifyEV(0.12)).toBe('high'));
});

describe('formatEV', () => {
  it('formats positive EV with + sign', () => expect(formatEV(0.083)).toBe('+8.3%'));
  it('formats negative EV with - sign', () => expect(formatEV(-0.021)).toBe('-2.1%'));
  it('formats zero', () => expect(formatEV(0)).toBe('+0.0%'));
});
