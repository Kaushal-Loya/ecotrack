import prisma from '../lib/prisma.js';
import type { FootprintBreakdown, Category } from '../types/index.js';
import {
  TRANSPORT_FACTORS,
  DIET_FACTORS,
  ENERGY_FACTORS,
  SHOPPING_FACTORS,
} from '../lib/emissionFactors.js';

export { computeCo2Kg, invalidateEmissionFactorCache, getAllEmissionFactors } from './emissionService.js';

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
    WEEKS_PER_YEAR *
      (inputs.weeklyCarKm * TRANSPORT_FACTORS.carPerKm +
        inputs.weeklyBusKm * TRANSPORT_FACTORS.busPerKm +
        inputs.weeklyTrainKm * TRANSPORT_FACTORS.trainPerKm) +
    inputs.yearlyFlightKm * TRANSPORT_FACTORS.flightPerKm;

  const dietKg =
    WEEKS_PER_YEAR *
    (inputs.beefMealsPerWeek * DIET_FACTORS.beefPerMeal +
      inputs.otherMeatMealsPerWeek * DIET_FACTORS.otherMeatPerMeal +
      inputs.vegetarianMealsPerWeek * DIET_FACTORS.vegetarianPerMeal);

  const energyKg =
    MONTHS_PER_YEAR *
    (inputs.monthlyElectricityKwh * ENERGY_FACTORS.electricityPerKwh +
      inputs.monthlyGasKwh * ENERGY_FACTORS.naturalGasPerKwh);

  const shoppingKg =
    MONTHS_PER_YEAR *
    (inputs.monthlyClothingItems * SHOPPING_FACTORS.clothingPerItem +
      inputs.monthlyOnlineOrders * SHOPPING_FACTORS.onlineOrderPerItem);

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
