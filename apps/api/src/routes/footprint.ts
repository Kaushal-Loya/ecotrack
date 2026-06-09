import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as footprintService from '../services/footprintService.js';

const router = Router();

const calculateSchema = z.object({
  weeklyCarKm: z.number().min(0).max(10000),
  weeklyBusKm: z.number().min(0).max(10000),
  weeklyTrainKm: z.number().min(0).max(10000),
  yearlyFlightKm: z.number().min(0).max(1000000),
  beefMealsPerWeek: z.number().min(0).max(21),
  otherMeatMealsPerWeek: z.number().min(0).max(21),
  vegetarianMealsPerWeek: z.number().min(0).max(21),
  monthlyElectricityKwh: z.number().min(0).max(10000),
  monthlyGasKwh: z.number().min(0).max(10000),
  monthlyClothingItems: z.number().min(0).max(100),
  monthlyOnlineOrders: z.number().min(0).max(1000),
});

// GET /footprint — current footprint summary
router.get(
  '/',
  authenticate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.sub;
      const [live, snapshot] = await Promise.all([
        footprintService.getUserFootprint(userId),
        footprintService.getLatestSnapshot(userId),
      ]);
      res.json({ status: 'success', data: { live, snapshot } });
    } catch (err) {
      next(err);
    }
  }
);

// POST /footprint/calculate — onboarding calculation
router.post(
  '/calculate',
  authenticate,
  validate(calculateSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.sub;
      const inputs = req.body as z.infer<typeof calculateSchema>;
      const breakdown = await footprintService.calculateAndSaveFootprint(userId, inputs);
      res.status(201).json({ status: 'success', data: breakdown });
    } catch (err) {
      next(err);
    }
  }
);

// GET /footprint/factors — list all emission factors
router.get(
  '/factors',
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const factors = await footprintService.getAllEmissionFactors();
      res.json({ status: 'success', data: factors });
    } catch (err) {
      next(err);
    }
  }
);

// POST /footprint/factors/invalidate — admin: clear in-memory cache
router.post(
  '/factors/invalidate',
  authenticate,
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      footprintService.invalidateEmissionFactorCache();
      // Re-load into cache immediately so next request is fast
      await footprintService.getAllEmissionFactors();
      res.json({ status: 'success', message: 'Emission factor cache invalidated and reloaded' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
