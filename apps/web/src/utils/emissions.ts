import type { Category } from '../types/index.js';

/** Format a CO₂ value as a human-readable string */
export function formatCo2(kg: number): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(1)} t CO₂`;
  }
  return `${kg.toFixed(1)} kg CO₂`;
}

/** Return a Tailwind colour class based on category */
export function categoryColor(category: Category): string {
  const map: Record<Category, string> = {
    transport: 'text-sky-400',
    diet: 'text-earth-400',
    energy: 'text-amber-400',
    shopping: 'text-purple-400',
  };
  return map[category] ?? 'text-gray-400';
}

/** Return a hex fill colour for Recharts per category */
export function categoryHex(category: Category): string {
  const map: Record<Category, string> = {
    transport: '#38bdf8', // sky-400
    diet: '#facc15',     // earth-400
    energy: '#fb923c',   // orange-400
    shopping: '#c084fc', // purple-400
  };
  return map[category] ?? '#6b7280';
}

export const CATEGORY_LABELS: Record<Category, string> = {
  transport: '🚗 Transport',
  diet: '🥩 Diet',
  energy: '⚡ Energy',
  shopping: '🛍️ Shopping',
};

/** Average annual CO₂ footprint in kg by region (for comparison) */
export const AVERAGE_FOOTPRINTS: Record<string, number> = {
  India: 1700,
  World: 4700,
  EU: 7500,
  USA: 14000,
};

/** Percentage of reduction relative to a baseline */
export function reductionPercent(baseline: number, current: number): number {
  if (baseline === 0) return 0;
  return Math.max(0, Math.round(((baseline - current) / baseline) * 100));
}

/** Date to ISO string without time */
export function toDateString(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
