import { Router } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { optionalAuth } from '@/middleware/auth';

const prisma = new PrismaClient();
const router = Router();

// 🔍 Search locations
router.get('/locations', optionalAuth, async (req, res, next) => {
  try {
    const q = (req.query['q'] as string) || '';
    const page = parseInt((req.query['page'] as string) || '1', 10);
    const limit = parseInt((req.query['limit'] as string) || '50', 10);
    const skip = (page - 1) * limit;

    let where: Prisma.LocationWhereInput | undefined = undefined;

    if (q.trim()) {
      where = {
        isActive: true,
        verified: true,
        OR: [
          { name: { contains: q, mode: 'insensitive' as Prisma.QueryMode } },
          { description: { contains: q, mode: 'insensitive' as Prisma.QueryMode } },
          { city: { contains: q, mode: 'insensitive' as Prisma.QueryMode } },
          { state: { contains: q, mode: 'insensitive' as Prisma.QueryMode } },
        ],
      };
    } else {
      where = { isActive: true, verified: true };
    }

    const [results, total] = await Promise.all([
      prisma.location.findMany({
        where,
        skip,
        take: limit,
        orderBy: { rating: 'desc' },
      }),
      prisma.location.count({ where }),
    ]);

    res.json({
      success: true,
      data: results,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
