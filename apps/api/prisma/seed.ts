import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Emission factors sourced from:
 * - EPA: https://www.epa.gov/energy/greenhouse-gases-equivalencies-calculator-calculations-and-references
 * - IPCC AR6: https://www.ipcc.ch/report/ar6/
 * - DEFRA 2023: https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2023
 */
const emissionFactors = [
  // ─── Transport ────────────────────────────────────────────────────────────
  { category: 'transport', subtype: 'car_petrol',   unit: 'km',   kgCo2: 0.192, source: 'DEFRA 2023' },
  { category: 'transport', subtype: 'car_diesel',   unit: 'km',   kgCo2: 0.171, source: 'DEFRA 2023' },
  { category: 'transport', subtype: 'car_electric', unit: 'km',   kgCo2: 0.053, source: 'DEFRA 2023' },
  { category: 'transport', subtype: 'bus',          unit: 'km',   kgCo2: 0.089, source: 'DEFRA 2023' },
  { category: 'transport', subtype: 'train',        unit: 'km',   kgCo2: 0.041, source: 'DEFRA 2023' },
  { category: 'transport', subtype: 'flight_short', unit: 'km',   kgCo2: 0.255, source: 'DEFRA 2023' },
  { category: 'transport', subtype: 'flight_long',  unit: 'km',   kgCo2: 0.195, source: 'DEFRA 2023' },
  { category: 'transport', subtype: 'motorbike',    unit: 'km',   kgCo2: 0.114, source: 'DEFRA 2023' },

  // ─── Diet ─────────────────────────────────────────────────────────────────
  { category: 'diet', subtype: 'beef',        unit: 'meal', kgCo2: 6.61,  source: 'IPCC AR6' },
  { category: 'diet', subtype: 'pork',        unit: 'meal', kgCo2: 1.84,  source: 'IPCC AR6' },
  { category: 'diet', subtype: 'chicken',     unit: 'meal', kgCo2: 0.88,  source: 'IPCC AR6' },
  { category: 'diet', subtype: 'fish',        unit: 'meal', kgCo2: 0.72,  source: 'IPCC AR6' },
  { category: 'diet', subtype: 'vegetarian',  unit: 'meal', kgCo2: 0.44,  source: 'IPCC AR6' },
  { category: 'diet', subtype: 'vegan',       unit: 'meal', kgCo2: 0.28,  source: 'IPCC AR6' },

  // ─── Energy ───────────────────────────────────────────────────────────────
  { category: 'energy', subtype: 'electricity', unit: 'kWh',  kgCo2: 0.233, source: 'EPA 2023' },
  { category: 'energy', subtype: 'natural_gas', unit: 'kWh',  kgCo2: 0.203, source: 'DEFRA 2023' },
  { category: 'energy', subtype: 'heating_oil', unit: 'litre', kgCo2: 2.52, source: 'DEFRA 2023' },

  // ─── Shopping ─────────────────────────────────────────────────────────────
  { category: 'shopping', subtype: 'clothing',     unit: 'item', kgCo2: 10.5,  source: 'DEFRA 2023' },
  { category: 'shopping', subtype: 'electronics',  unit: 'item', kgCo2: 70.0,  source: 'DEFRA 2023' },
  { category: 'shopping', subtype: 'online_order', unit: 'item', kgCo2: 0.44,  source: 'DEFRA 2023' },
];

async function main(): Promise<void> {
  console.log('🌱 Seeding emission factors…');

  for (const factor of emissionFactors) {
    await prisma.emissionFactor.upsert({
      where: { category_subtype: { category: factor.category, subtype: factor.subtype } },
      update: { kgCo2: factor.kgCo2, unit: factor.unit, source: factor.source },
      create: factor,
    });
  }

  console.log(`✅ Seeded ${emissionFactors.length} emission factors`);

  // Seed demo user for E2E tests (idempotent)
  const demoEmail = 'demo@example.com';
  const existing = await prisma.user.findUnique({ where: { email: demoEmail } });
  if (!existing) {
    const passwordHash = await bcrypt.hash('DemoPass1', 12);
    await prisma.user.create({
      data: { email: demoEmail, passwordHash, name: 'Demo User' },
    });
    console.log('✅ Seeded demo user (demo@example.com / DemoPass1)');
  } else {
    console.log('ℹ️  Demo user already exists, skipping');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
