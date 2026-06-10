import prisma from '../lib/prisma.js';
import { ValidationError } from '../errors/AppError.js';

type EmissionFactorRecord = Awaited<ReturnType<typeof prisma.emissionFactor.findMany>>[number];

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

export async function getAllEmissionFactors(): Promise<
  { category: string; subtype: string; unit: string; kgCo2: number; source: string }[]
> {
  return prisma.emissionFactor.findMany({ orderBy: [{ category: 'asc' }, { subtype: 'asc' }] });
}
