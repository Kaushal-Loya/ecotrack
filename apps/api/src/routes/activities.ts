import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { computeCo2Kg } from '../services/footprintService.js';
import { NotFoundError, ForbiddenError } from '../errors/AppError.js';

const router = Router();

const VALID_CATEGORIES = ['transport', 'diet', 'energy', 'shopping'] as const;

const createActivitySchema = z.object({
  category: z.enum(VALID_CATEGORIES),
  subtype: z.string().min(1).max(50).trim(),
  amount: z.number().positive().max(1000000),
  unit: z.string().min(1).max(20).trim(),
  note: z.string().max(500).trim().optional(),
  loggedAt: z.string().datetime().optional(),
});

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  category: z.enum(VALID_CATEGORIES).optional(),
  range: z.enum(['week', 'month', 'year', 'all']).default('month'),
});

// POST /activities
router.post(
  '/',
  authenticate,
  validate(createActivitySchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.sub;
      const { category, subtype, amount, unit, note, loggedAt } =
        req.body as z.infer<typeof createActivitySchema>;

      const co2Kg = await computeCo2Kg(category, subtype, amount);

      const activity = await prisma.activityLog.create({
        data: {
          userId,
          category,
          subtype,
          amount,
          unit,
          co2Kg,
          note,
          loggedAt: loggedAt ? new Date(loggedAt) : new Date(),
        },
      });

      res.status(201).json({ status: 'success', data: activity });
    } catch (err) {
      next(err);
    }
  }
);

// GET /activities
router.get(
  '/',
  authenticate,
  validate(querySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.sub;
      const { page, pageSize, category, range } = req.query as unknown as z.infer<typeof querySchema>;

      const since = new Date();
      if (range === 'week') since.setDate(since.getDate() - 7);
      else if (range === 'month') since.setMonth(since.getMonth() - 1);
      else if (range === 'year') since.setFullYear(since.getFullYear() - 1);
      else since.setFullYear(2000);

      const where = {
        userId,
        loggedAt: { gte: since },
        ...(category ? { category } : {}),
      };

      const [total, data] = await Promise.all([
        prisma.activityLog.count({ where }),
        prisma.activityLog.findMany({
          where,
          orderBy: { loggedAt: 'desc' },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
      ]);

      res.json({
        status: 'success',
        data,
        meta: { total, page, pageSize, hasMore: page * pageSize < total },
      });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /activities/:id
router.delete(
  '/:id',
  authenticate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.sub;
      const { id } = req.params;

      const activity = await prisma.activityLog.findUnique({ where: { id } });
      if (!activity) throw new NotFoundError('Activity');
      if (activity.userId !== userId) throw new ForbiddenError();

      await prisma.activityLog.delete({ where: { id } });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

export default router;
