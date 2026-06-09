import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPersonalisedInsights } from '../services/insightService.js';

describe('insightService.getPersonalisedInsights', () => {
  it('returns top 3 tips prioritised by highest emission category', () => {
    const tips = getPersonalisedInsights({
      transport: 2500,
      diet: 800,
      energy: 200,
      shopping: 100,
    });
    expect(tips).toHaveLength(3);
    expect(tips[0].category).toBe('transport');
  });

  it('returns tips for diet as top category when diet emissions are highest', () => {
    const tips = getPersonalisedInsights({
      transport: 100,
      diet: 3000,
      energy: 50,
      shopping: 50,
    });
    expect(tips[0].category).toBe('diet');
  });

  it('returns tips for energy when energy dominates', () => {
    const tips = getPersonalisedInsights({
      transport: 100,
      diet: 100,
      energy: 2000,
      shopping: 50,
    });
    expect(tips[0].category).toBe('energy');
  });

  it('returns at most 3 tips', () => {
    const tips = getPersonalisedInsights({
      transport: 5000,
      diet: 4000,
      energy: 3000,
      shopping: 2000,
    });
    expect(tips.length).toBeLessThanOrEqual(3);
  });

  it('each tip has required fields', () => {
    const tips = getPersonalisedInsights({
      transport: 500,
      diet: 500,
      energy: 500,
      shopping: 500,
    });
    for (const tip of tips) {
      expect(tip).toHaveProperty('category');
      expect(tip).toHaveProperty('title');
      expect(tip).toHaveProperty('description');
      expect(tip).toHaveProperty('potentialSavingKg');
      expect(typeof tip.potentialSavingKg).toBe('number');
    }
  });

  it('handles zero emissions gracefully', () => {
    const tips = getPersonalisedInsights({
      transport: 0,
      diet: 0,
      energy: 0,
      shopping: 0,
    });
    expect(Array.isArray(tips)).toBe(true);
    expect(tips.length).toBeLessThanOrEqual(3);
  });
});
