import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@prisma/client', () => {
  const mockGoal = {
    id: 'goal-1',
    userId: 'user-1',
    title: 'Reduce transport',
    targetKg: 2000,
    baselineKg: 3000,
    deadline: new Date('2025-12-31'),
    achieved: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrisma = {
    goal: {
      create: vi.fn().mockResolvedValue(mockGoal),
      findMany: vi.fn().mockResolvedValue([mockGoal]),
      findUnique: vi.fn().mockImplementation(({ where: { id } }: { where: { id: string } }) => {
        if (id === 'goal-1') return mockGoal;
        if (id === 'goal-99') return null;
        if (id === 'goal-forbidden') return { ...mockGoal, id: 'goal-forbidden', userId: 'other-user' };
        return null;
      }),
      update: vi.fn().mockImplementation(({ where: { id }, data }) => ({
        ...mockGoal,
        ...data,
        id,
      })),
      delete: vi.fn().mockResolvedValue(mockGoal),
    },
    activityLog: {
      groupBy: vi.fn().mockResolvedValue([
        { category: 'transport', _sum: { co2Kg: 500 } },
        { category: 'diet', _sum: { co2Kg: 300 } },
      ]),
    },
  };
  return { PrismaClient: vi.fn(() => mockPrisma) };
});

import {
  createGoal,
  listGoals,
  updateGoal,
  deleteGoal,
} from '../services/goalService.js';
import { NotFoundError, ForbiddenError } from '../errors/AppError.js';

describe('goalService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createGoal', () => {
    it('creates a goal with correct data', async () => {
      const goal = await createGoal('user-1', {
        title: 'Reduce transport',
        targetKg: 2000,
        baselineKg: 3000,
        deadline: new Date('2025-12-31'),
      });

      expect(goal.title).toBe('Reduce transport');
      expect(goal.targetKg).toBe(2000);
      expect(goal.baselineKg).toBe(3000);
    });
  });

  describe('listGoals', () => {
    it('returns goals with computed progress percent', async () => {
      const goals = await listGoals('user-1');

      expect(goals).toHaveLength(1);
      expect(goals[0]).toHaveProperty('progressPercent');
      expect(goals[0]).toHaveProperty('currentKg');
      expect(goals[0].currentKg).toBeGreaterThan(0);
    });

    it('returns 0 progress when currentKg equals baseline', async () => {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new (PrismaClient as unknown as new () => {
        goal: { findMany: typeof vi.fn };
        activityLog: { groupBy: typeof vi.fn };
      })();
      vi.mocked(prisma.activityLog.groupBy).mockResolvedValueOnce([
        { category: 'transport', _sum: { co2Kg: 3000 } },
      ]);

      const goals = await listGoals('user-1');
      expect(goals[0].progressPercent).toBe(0);
    });
  });

  describe('updateGoal', () => {
    it('updates a goal and returns with progress', async () => {
      const updated = await updateGoal('user-1', 'goal-1', {
        title: 'Updated title',
        achieved: true,
      });

      expect(updated.title).toBe('Updated title');
      expect(updated.achieved).toBe(true);
      expect(updated).toHaveProperty('progressPercent');
    });

    it('throws NotFoundError for non-existent goal', async () => {
      await expect(
        updateGoal('user-1', 'goal-99', { title: 'Nope' })
      ).rejects.toThrow(NotFoundError);
    });

    it('throws ForbiddenError when userId does not match', async () => {
      await expect(
        updateGoal('user-1', 'goal-forbidden', { title: 'Nope' })
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('deleteGoal', () => {
    it('deletes a goal owned by the user', async () => {
      await expect(deleteGoal('user-1', 'goal-1')).resolves.toBeUndefined();
    });

    it('throws NotFoundError for non-existent goal', async () => {
      await expect(deleteGoal('user-1', 'goal-99')).rejects.toThrow(NotFoundError);
    });

    it('throws ForbiddenError when userId does not match', async () => {
      await expect(deleteGoal('user-1', 'goal-forbidden')).rejects.toThrow(ForbiddenError);
    });
  });
});
