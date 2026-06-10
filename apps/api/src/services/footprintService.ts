import prisma from '../lib/prisma.js';
import { ValidationError } from '../errors/AppError.js';
import type { FootprintBreakdown, Category } from '../types/index.js';
import {
  TRANSPORT_FACTORS,
  DIET_FACTORS,
  ENERGY_FACTORS,
  SHOPPING_FACTORS,
} from '../lib/emissionFactors.js';

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
  const WEEKS_PER_YEAR = 52;
  const MONTHS_PER_YEAR = 12;

  const transportKg =
    inputs.weeklyCarKm * WEEKS_PER_YEAR * TRANSPORT_FACTORS.carPerKm +
    inputs.weeklyBusKm * WEEKS_PER_YEAR * TRANSPORT_FACTORS.busPerKm +
    inputs.weeklyTrainKm * WEEKS_PER_YEAR * TRANSPORT_FACTORS.trainPerKm +
    inputs.yearlyFlightKm * TRANSPORT_FACTORS.flightPerKm;

  const dietKg =
    inputs.beefMealsPerWeek * WEEKS_PER_YEAR * DIET_FACTORS.beefPerMeal +
    inputs.otherMeatMealsPerWeek * WEEKS_PER_YEAR * DIET_FACTORS.otherMeatPerMeal +
    inputs.vegetarianMealsPerWeek * WEEKS_PER_YEAR * DIET_FACTORS.vegetarianPerMeal;

  const energyKg =
    inputs.monthlyElectricityKwh * MONTHS_PER_YEAR * ENERGY_FACTORS.electricityPerKwh +
    inputs.monthlyGasKwh * MONTHS_PER_YEAR * ENERGY_FACTORS.naturalGasPerKwh;

  const shoppingKg =
    inputs.monthlyClothingItems * MONTHS_PER_YEAR * SHOPPING_FACTORS.clothingPerItem +
    inputs.monthlyOnlineOrders * MONTHS_PER_YEAR * SHOPPING_FACTORS.onlineOrderPerItem;

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
