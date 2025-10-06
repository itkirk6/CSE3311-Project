import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { optionalAuth } from '@/middleware/auth';

const prisma = new PrismaClient();
const router = Router();

/**
 * General search endpoint
 * Example: /api/search?q=park
 */
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { q } = req.query;
    const query = (q as string)?.trim();

    if (!query) {
      res.json({ success: true, data: [] });
      return;
    }

    const locations = await prisma.location.findMany({
      where: { name: { contains: query, mode: 'insensitive' } },
    });

    res.json({
      success: true,
      data: { locations },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Entity-specific routes
 * Example: /api/search/locations?q=park
 */
router.get('/locations', optionalAuth, async (req, res, next) => {
  try {
    const { q } = req.query;
    const query = (q as string)?.trim();

    const locations = query
      ? await prisma.location.findMany({
          where: { name: { contains: query, mode: 'insensitive' } },
        })
      : [];

    res.json({ success: true, data: locations });
  } catch (error) {
    next(error);
  }
});


export default router;
