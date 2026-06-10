import type { Category } from '@carbon/shared';
import {
  TRANSPORT_FACTORS,
  DIET_FACTORS,
  ENERGY_FACTORS,
  SHOPPING_FACTORS,
} from '@carbon/shared';

export const EMISSION_COEFFICIENTS = {
  carPerKm: TRANSPORT_FACTORS.carPerKm,
  busPerKm: TRANSPORT_FACTORS.busPerKm,
  trainPerKm: TRANSPORT_FACTORS.trainPerKm,
  flightPerKm: TRANSPORT_FACTORS.flightPerKm,
  beefPerMeal: DIET_FACTORS.beefPerMeal,
  otherMeatPerMeal: DIET_FACTORS.otherMeatPerMeal,
  vegetarianPerMeal: DIET_FACTORS.vegetarianPerMeal,
  electricityPerKwh: ENERGY_FACTORS.electricityPerKwh,
  naturalGasPerKwh: ENERGY_FACTORS.naturalGasPerKwh,
  clothingPerItem: SHOPPING_FACTORS.clothingPerItem,
  onlineOrderPerItem: SHOPPING_FACTORS.onlineOrderPerItem,
} as const;

export function formatCo2(kg: number): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(1)} t CO₂`;
  }
  return `${kg.toFixed(1)} kg CO₂`;
}

export function categoryColor(category: Category): string {
  const map: Record<Category, string> = {
    transport: 'text-sky-400',
    diet: 'text-earth-400',
    energy: 'text-amber-400',
    shopping: 'text-purple-400',
  };
  return map[category] ?? 'text-gray-400';
}

export function categoryHex(category: Category): string {
  const map: Record<Category, string> = {
    transport: '#38bdf8',
    diet: '#facc15',
    energy: '#fb923c',
    shopping: '#c084fc',
  };
  return map[category] ?? '#6b7280';
}

export const CATEGORY_LABELS: Record<Category, string> = {
  transport: '🚗 Transport',
  diet: '🥩 Diet',
  energy: '⚡ Energy',
  shopping: '🛍️ Shopping',
};

export const AVERAGE_FOOTPRINTS: Record<string, number> = {
  India: 1700,
  World: 4700,
  EU: 7500,
  USA: 14000,
};

export function reductionPercent(baseline: number, current: number): number {
  if (baseline === 0) return 0;
  return Math.max(0, Math.round(((baseline - current) / baseline) * 100));
}

export function toDateString(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
