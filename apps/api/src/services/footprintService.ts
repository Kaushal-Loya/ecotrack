import { PrismaClient } from '@prisma/client';
import { NotFoundError, ValidationError } from '../errors/AppError.js';
import type { FootprintBreakdown, Category } from '../types/index.js';

const prisma = new PrismaClient();
type EmissionFactorRecord = Awaited<ReturnType<typeof prisma.emissionFactor.findMany>>[number];

// In-memory cache for emission factors (loaded once at startup)
let emissionFactorCache: Map<string, number> | null = null;

async function getEmissionFactors(): Promise<Map<string, number>> {
  if (emissionFactorCache) return emissionFactorCache;

  const factors = await prisma.emissionFactor.findMany();
  emissionFactorCache = new Map(
    factors.map((f: EmissionFactorRecord) => [
      `${f.category}:${f.subtype}`,
      f.kgCo2,
    ])
  );
  return emissionFactorCache;
}

export function invalidateEmissionFactorCache(): void {
  emissionFactorCache = null;
}

/**
 * Compute CO₂ kg for a single activity.
 * Returns 0 if no factor found (safe default — log an unknown subtype).
 */
export async function computeCo2Kg(
  category: string,
  subtype: string,
  amount: number
): Promise<number> {
  const factors = await getEmissionFactors();
  const factor = factors.get(`${category}:${subtype}`);
  if (factor === undefined) {
    throw new ValidationError(`Unknown activity type: ${category}/${subtype}`, {
      subtype: [`No emission factor found for "${subtype}" in category "${category}"`],
    });
  }
  return parseFloat((factor * amount).toFixed(4));
}

/**
 * Returns the current aggregate footprint for a user broken down by category.
 * Aggregates the last 365 days of activity logs.
 */
export async function getUserFootprint(userId: string): Promise<FootprintBreakdown> {
  const since = new Date();
  since.setFullYear(since.getFullYear() - 1);

  const rows = await prisma.activityLog.groupBy({
    by: ['category'],
    where: { userId, loggedAt: { gte: since } },
    _sum: { co2Kg: true },
  });

  const breakdown: FootprintBreakdown = {
    transport: 0,
    diet: 0,
    energy: 0,
    shopping: 0,
    total: 0,
  };

  for (const row of rows) {
    const cat = row.category as Category;
    const val = row._sum.co2Kg ?? 0;
    if (cat in breakdown) {
      breakdown[cat] = parseFloat(val.toFixed(2));
    }
  }
  breakdown.total = parseFloat(
    (breakdown.transport + breakdown.diet + breakdown.energy + breakdown.shopping).toFixed(2)
  );

  return breakdown;
}

/**
 * Takes the onboarding form inputs, computes a full-year footprint projection,
 * saves a snapshot, and returns the breakdown.
 */
export async function calculateAndSaveFootprint(
  userId: string,
  inputs: {
    weeklyCarKm: number;
    weeklyBusKm: number;
    weeklyTrainKm: number;
    yearlyFlightKm: number;
    beefMealsPerWeek: number;
    otherMeatMealsPerWeek: number;
    vegetarianMealsPerWeek: number;
    monthlyElectricityKwh: number;
    monthlyGasKwh: number;
    monthlyClothingItems: number;
    monthlyOnlineOrders: number;
  }
): Promise<FootprintBreakdown> {
  const w = 52; // weeks per year

  const transportKg =
    inputs.weeklyCarKm * w * 0.192 +
    inputs.weeklyBusKm * w * 0.089 +
    inputs.weeklyTrainKm * w * 0.041 +
    inputs.yearlyFlightKm * 0.225;

  const dietKg =
    inputs.beefMealsPerWeek * w * 6.61 +
    inputs.otherMeatMealsPerWeek * w * 1.36 +
    inputs.vegetarianMealsPerWeek * w * 0.44;

  const energyKg =
    inputs.monthlyElectricityKwh * 12 * 0.233 +
    inputs.monthlyGasKwh * 12 * 0.203;

  const shoppingKg =
    inputs.monthlyClothingItems * 12 * 10.5 +
    inputs.monthlyOnlineOrders * 12 * 0.44;

  const breakdown: FootprintBreakdown = {
    transport: parseFloat(transportKg.toFixed(2)),
    diet: parseFloat(dietKg.toFixed(2)),
    energy: parseFloat(energyKg.toFixed(2)),
    shopping: parseFloat(shoppingKg.toFixed(2)),
    total: parseFloat((transportKg + dietKg + energyKg + shoppingKg).toFixed(2)),
  };

  await prisma.footprintSnapshot.create({
    data: {
      userId,
      totalKgYear: breakdown.total,
      transport: breakdown.transport,
      diet: breakdown.diet,
      energy: breakdown.energy,
      shopping: breakdown.shopping,
    },
  });

  return breakdown;
}

export async function getLatestSnapshot(
  userId: string
): Promise<FootprintBreakdown | null> {
  const snapshot = await prisma.footprintSnapshot.findFirst({
    where: { userId },
    orderBy: { snapshotAt: 'desc' },
  });

  if (!snapshot) return null;

  return {
    transport: snapshot.transport,
    diet: snapshot.diet,
    energy: snapshot.energy,
    shopping: snapshot.shopping,
    total: snapshot.totalKgYear,
  };
}

export async function getAllEmissionFactors(): Promise<
  { category: string; subtype: string; unit: string; kgCo2: number; source: string }[]
> {
  return prisma.emissionFactor.findMany({ orderBy: [{ category: 'asc' }, { subtype: 'asc' }] });
}

export { NotFoundError };
