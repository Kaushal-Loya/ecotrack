import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getUserFootprint, getLatestSnapshot } from '../services/footprintService.js';
import { getPersonalisedInsights } from '../services/insightService.js';

const router = Router();

// GET /insights
router.get(
  '/',
  authenticate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.sub;

      // Use live aggregated footprint; fallback to latest snapshot if no activities yet
      const live = await getUserFootprint(userId);
      const breakdown =
        live.total > 0
          ? live
          : (await getLatestSnapshot(userId)) ?? { transport: 0, diet: 0, energy: 0, shopping: 0, total: 0 };

      const tips = getPersonalisedInsights(breakdown);
      res.json({ status: 'success', data: tips });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
