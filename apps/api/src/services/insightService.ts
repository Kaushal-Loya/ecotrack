import type { Category, InsightTip } from '../types/index.js';

type InsightRule = {
  category: Category;
  minKgThreshold: number;
  tip: Omit<InsightTip, 'category'>;
};

/**
 * Rule-based insight engine.
 * Rules are evaluated in order; top rules for the user's highest-emission category surface first.
 */
const INSIGHT_RULES: InsightRule[] = [
  // Transport
  {
    category: 'transport',
    minKgThreshold: 500,
    tip: {
      title: 'Switch to public transit twice a week',
      description:
        'Taking the bus or train instead of driving just 2 days a week can cut your transport emissions by up to 25%.',
      potentialSavingKg: 120,
    },
  },
  {
    category: 'transport',
    minKgThreshold: 1000,
    tip: {
      title: 'Consider carpooling',
      description:
        'Sharing rides for your regular commute halves the per-person emissions and saves money on fuel.',
      potentialSavingKg: 200,
    },
  },
  {
    category: 'transport',
    minKgThreshold: 2000,
    tip: {
      title: 'Offset your flights',
      description:
        'A long-haul return flight can emit 2 tonnes of CO₂. Use a certified offset programme like Gold Standard for flights you cannot avoid.',
      potentialSavingKg: 0,
    },
  },
  {
    category: 'transport',
    minKgThreshold: 0,
    tip: {
      title: 'Walk or cycle for short trips',
      description:
        'Trips under 5 km account for a large share of urban car journeys. Switch these to cycling or walking for zero-emission travel.',
      potentialSavingKg: 60,
    },
  },

  // Diet
  {
    category: 'diet',
    minKgThreshold: 1000,
    tip: {
      title: 'Try meat-free Mondays',
      description:
        'Cutting beef from just one meal a week saves around 343 kg CO₂ per year — equivalent to driving 1,700 km.',
      potentialSavingKg: 343,
    },
  },
  {
    category: 'diet',
    minKgThreshold: 500,
    tip: {
      title: 'Swap beef for chicken or fish',
      description:
        'Chicken emits 7× less CO₂ per meal than beef. Making this swap just 3 times a week can save 900 kg CO₂ per year.',
      potentialSavingKg: 900,
    },
  },
  {
    category: 'diet',
    minKgThreshold: 0,
    tip: {
      title: 'Reduce food waste',
      description:
        'Around 8–10% of global emissions come from wasted food. Plan meals, use leftovers, and compost scraps.',
      potentialSavingKg: 50,
    },
  },

  // Energy
  {
    category: 'energy',
    minKgThreshold: 500,
    tip: {
      title: 'Switch to a renewable electricity tariff',
      description:
        'Moving to 100% renewable electricity can cut your home energy emissions by up to 80% at little or no extra cost.',
      potentialSavingKg: 400,
    },
  },
  {
    category: 'energy',
    minKgThreshold: 200,
    tip: {
      title: 'Improve home insulation',
      description:
        'Proper loft and wall insulation reduces heating demand by 30–50%, saving both money and carbon.',
      potentialSavingKg: 250,
    },
  },
  {
    category: 'energy',
    minKgThreshold: 0,
    tip: {
      title: 'Lower your thermostat by 1°C',
      description:
        'Reducing your heating by just 1°C saves about 10% on your heating bill and around 100 kg CO₂ per year.',
      potentialSavingKg: 100,
    },
  },

  // Shopping
  {
    category: 'shopping',
    minKgThreshold: 300,
    tip: {
      title: 'Buy second-hand clothing',
      description:
        'The fashion industry contributes 10% of global emissions. Buying pre-loved items eliminates the manufacturing footprint entirely.',
      potentialSavingKg: 180,
    },
  },
  {
    category: 'shopping',
    minKgThreshold: 0,
    tip: {
      title: 'Batch your online deliveries',
      description:
        'Consolidating online orders into weekly deliveries and choosing slower shipping reduces last-mile delivery emissions by up to 30%.',
      potentialSavingKg: 20,
    },
  },
];

/**
 * Returns the top 3 personalised tips based on the user's emission breakdown.
 * Tips are prioritised by the user's highest-emission categories.
 */
export function getPersonalisedInsights(
  breakdown: { transport: number; diet: number; energy: number; shopping: number }
): InsightTip[] {
  const categories = [
    ['transport', breakdown.transport] as const,
    ['diet', breakdown.diet] as const,
    ['energy', breakdown.energy] as const,
    ['shopping', breakdown.shopping] as const,
  ].sort((a, b) => b[1] - a[1]) as unknown as [Category, number][];

  const results: InsightTip[] = [];
  const usedCategories = new Set<Category>();

  for (const [category, kg] of categories) {
    if (results.length >= 3) break;

    const applicable = INSIGHT_RULES.filter(
      (r) => r.category === category && kg >= r.minKgThreshold
    ).sort((a, b) => b.minKgThreshold - a.minKgThreshold);

    for (const rule of applicable) {
      if (results.length >= 3) break;
      results.push({ category: rule.category, ...rule.tip });
    }
    usedCategories.add(category);
  }

  return results.slice(0, 3);
}
