import { PrismaClient } from '@prisma/client';
import { NotFoundError, ForbiddenError } from '../errors/AppError.js';
import { getUserFootprint } from './footprintService.js';

const prisma = new PrismaClient();
type Goal = {
  id: string;
  userId: string;
  title: string;
  targetKg: number;
  baselineKg: number;
  deadline: Date;
  achieved: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type GoalWithProgress = Goal & {
  currentKg: number;
  progressPercent: number;
};

export async function createGoal(
  userId: string,
  data: { title: string; targetKg: number; baselineKg: number; deadline: Date }
): Promise<Goal> {
  return prisma.goal.create({
    data: { userId, ...data },
  });
}

export async function listGoals(userId: string): Promise<GoalWithProgress[]> {
  const goals = await prisma.goal.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  const footprint = await getUserFootprint(userId);
  const currentKg = footprint.total;

  return goals.map((goal: Goal) => {
    const reduced = goal.baselineKg - currentKg;
    const targetReduction = goal.baselineKg - goal.targetKg;
    const progressPercent =
      targetReduction <= 0 ? 0 : Math.min(100, Math.round((reduced / targetReduction) * 100));

    return { ...goal, currentKg, progressPercent };
  });
}

export async function updateGoal(
  userId: string,
  goalId: string,
  data: Partial<{ title: string; targetKg: number; deadline: Date; achieved: boolean }>
): Promise<GoalWithProgress> {
  const goal = await prisma.goal.findUnique({ where: { id: goalId } });
  if (!goal) throw new NotFoundError('Goal');
  if (goal.userId !== userId) throw new ForbiddenError();

  const updated = await prisma.goal.update({ where: { id: goalId }, data });
  const footprint = await getUserFootprint(userId);
  const currentKg = footprint.total;
  const reduced = updated.baselineKg - currentKg;
  const targetReduction = updated.baselineKg - updated.targetKg;
  const progressPercent =
    targetReduction <= 0 ? 0 : Math.min(100, Math.round((reduced / targetReduction) * 100));

  return { ...updated, currentKg, progressPercent };
}

export async function deleteGoal(userId: string, goalId: string): Promise<void> {
  const goal = await prisma.goal.findUnique({ where: { id: goalId } });
  if (!goal) throw new NotFoundError('Goal');
  if (goal.userId !== userId) throw new ForbiddenError();
  await prisma.goal.delete({ where: { id: goalId } });
}
