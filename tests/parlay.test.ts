import { describe, it, expect } from 'vitest';
import { combinedProbability, parlayOdd, analyzeParlayy, hasSameEventConflict } from '@/lib/analytics/parlay';

const legA = { probability: 0.6, odd: 2.0, eventId: 'evt1' };
const legB = { probability: 0.5, odd: 2.2, eventId: 'evt2' };
const legC = { probability: 0.4, odd: 2.8, eventId: 'evt3' };

describe('combinedProbability', () => {
  it('single leg equals its own probability', () => {
    expect(combinedProbability([legA])).toBeCloseTo(0.6);
  });
  it('two legs multiply probabilities (independence)', () => {
    expect(combinedProbability([legA, legB])).toBeCloseTo(0.6 * 0.5);
  });
  it('three legs', () => {
    expect(combinedProbability([legA, legB, legC])).toBeCloseTo(0.6 * 0.5 * 0.4, 4);
  });
});

describe('parlayOdd', () => {
  it('single leg equals its own odd', () => {
    expect(parlayOdd([legA])).toBeCloseTo(2.0);
  });
  it('two legs multiply odds', () => {
    expect(parlayOdd([legA, legB])).toBeCloseTo(2.0 * 2.2);
  });
});

describe('hasSameEventConflict', () => {
  it('no conflict for different events', () => {
    expect(hasSameEventConflict([legA, legB])).toBe(false);
  });
  it('detects conflict when two legs share an event', () => {
    const conflicting = { probability: 0.4, odd: 2.2, eventId: 'evt1' };
    expect(hasSameEventConflict([legA, conflicting])).toBe(true);
  });
  it('no conflict when eventId is undefined', () => {
    const noId1 = { probability: 0.5, odd: 2.0 };
    const noId2 = { probability: 0.6, odd: 1.8 };
    expect(hasSameEventConflict([noId1, noId2])).toBe(false);
  });
});

describe('analyzeParlayy', () => {
  it('empty legs returns blocked', () => {
    const result = analyzeParlayy([]);
    expect(result.riskLevel).toBe('blocked');
  });

  it('two EV+ legs with good prob → low risk', () => {
    const result = analyzeParlayy([legA, legB]);
    expect(result.combinedProbability).toBeCloseTo(0.3);
    expect(result.parlayOdd).toBeCloseTo(4.4);
    expect(result.ev).toBeCloseTo(0.6 * 0.5 * 2.0 * 2.2 - 1, 3);
    expect(result.riskLevel).toBe('medium'); // prob=0.3 < 0.4 threshold → medium
  });

  it('same-event conflict → blocked', () => {
    const conflict = { probability: 0.4, odd: 2.5, eventId: 'evt1' };
    const result = analyzeParlayy([legA, conflict]);
    expect(result.riskLevel).toBe('blocked');
    expect(result.sameEventConflict).toBe(true);
  });

  it('very low combined probability → blocked', () => {
    const tiny1 = { probability: 0.1, odd: 10, eventId: 'a' };
    const tiny2 = { probability: 0.1, odd: 10, eventId: 'b' };
    const result = analyzeParlayy([tiny1, tiny2]);
    // prob = 0.01 < 0.15 → blocked (even though EV might be positive)
    expect(result.riskLevel).toBe('blocked');
  });
});
