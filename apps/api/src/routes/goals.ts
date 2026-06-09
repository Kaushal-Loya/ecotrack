import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as goalService from '../services/goalService.js';

const router = Router();

const createGoalSchema = z.object({
  title: z.string().trim().min(1).max(200),
  targetKg: z.number().positive(),
  baselineKg: z.number().positive(),
  deadline: z.string().datetime(),
});

const updateGoalSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  targetKg: z.number().positive().optional(),
  deadline: z.string().datetime().optional(),
  achieved: z.boolean().optional(),
});

// POST /goals
router.post(
  '/',
  authenticate,
  validate(createGoalSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.sub;
      const { title, targetKg, baselineKg, deadline } = req.body as z.infer<typeof createGoalSchema>;
      const goal = await goalService.createGoal(userId, {
        title,
        targetKg,
        baselineKg,
        deadline: new Date(deadline),
      });
      res.status(201).json({ status: 'success', data: goal });
    } catch (err) {
      next(err);
    }
  }
);

// GET /goals
router.get(
  '/',
  authenticate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const goals = await goalService.listGoals(req.user!.sub);
      res.json({ status: 'success', data: goals });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /goals/:id
router.patch(
  '/:id',
  authenticate,
  validate(updateGoalSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.sub;
      const data = req.body as z.infer<typeof updateGoalSchema>;
      const { deadline, ...rest } = data;
      const goal = await goalService.updateGoal(userId, req.params.id, {
        ...rest,
        ...(deadline ? { deadline: new Date(deadline) } : {}),
      });
      res.json({ status: 'success', data: goal });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /goals/:id
router.delete(
  '/:id',
  authenticate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await goalService.deleteGoal(req.user!.sub, req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

export default router;
