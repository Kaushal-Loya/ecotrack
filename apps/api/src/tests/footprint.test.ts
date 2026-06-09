import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock prisma to avoid real DB in unit tests
vi.mock('@prisma/client', () => {
  const mockPrisma = {
    emissionFactor: {
      findMany: vi.fn().mockResolvedValue([
        { category: 'transport', subtype: 'car_petrol', unit: 'km',   kgCo2: 0.192, source: 'DEFRA 2023' },
        { category: 'transport', subtype: 'bus',        unit: 'km',   kgCo2: 0.089, source: 'DEFRA 2023' },
        { category: 'diet',      subtype: 'beef',       unit: 'meal', kgCo2: 6.61,  source: 'IPCC AR6'   },
        { category: 'diet',      subtype: 'vegetarian', unit: 'meal', kgCo2: 0.44,  source: 'IPCC AR6'   },
        { category: 'energy',    subtype: 'electricity',unit: 'kWh',  kgCo2: 0.233, source: 'EPA 2023'   },
      ]),
    },
    activityLog: { groupBy: vi.fn() },
    footprintSnapshot: { create: vi.fn(), findFirst: vi.fn() },
  };
  return { PrismaClient: vi.fn(() => mockPrisma) };
});

import { computeCo2Kg, invalidateEmissionFactorCache } from '../services/footprintService.js';

describe('footprintService.computeCo2Kg', () => {
  beforeEach(() => {
    invalidateEmissionFactorCache();
  });

  it('computes CO₂ for car_petrol correctly', async () => {
    const co2 = await computeCo2Kg('transport', 'car_petrol', 100);
    expect(co2).toBeCloseTo(19.2, 1);
  });

  it('computes CO₂ for beef meal correctly', async () => {
    const co2 = await computeCo2Kg('diet', 'beef', 1);
    expect(co2).toBeCloseTo(6.61, 2);
  });

  it('computes CO₂ for electricity correctly', async () => {
    const co2 = await computeCo2Kg('energy', 'electricity', 200);
    expect(co2).toBeCloseTo(46.6, 1);
  });

  it('throws ValidationError for unknown subtype', async () => {
    await expect(computeCo2Kg('transport', 'hovercraft', 10)).rejects.toThrow(
      /unknown activity type|no emission factor/i
    );
  });

  it('handles zero amount returning 0', async () => {
    const co2 = await computeCo2Kg('transport', 'bus', 0);
    expect(co2).toBe(0);
  });

  it('rounds result to 4 decimal places', async () => {
    const co2 = await computeCo2Kg('transport', 'car_petrol', 1);
    expect(co2.toString().split('.')[1]?.length ?? 0).toBeLessThanOrEqual(4);
  });
});
