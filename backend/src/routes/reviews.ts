import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, optionalAuth } from '@/middleware/auth';

const prisma = new PrismaClient();
const router = Router();

// Public routes
router.get('/', optionalAuth, async (_req, res, next) => {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        user: true,
        location: true,
      },
    });
    res.json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const review = await prisma.review.findUnique({
      where: { id: req.params['id'] },
      include: { user: true, location: true },
    });

    if (!review) {
      throw new Error('Review not found');
    }

    res.json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
});

// Protected routes
router.post('/', authenticate, async (req: any, res, next) => {
  try {
    const { content, rating, locationId } = req.body;

    if (!locationId || typeof locationId !== 'string') {
      return res.status(400).json({ success: false, message: 'A valid locationId is required.' });
    }

    const parsedRating = Number(rating);
    if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res
        .status(400)
        .json({ success: false, message: 'Rating must be an integer between 1 and 5.' });
    }

    const existing = await prisma.review.findUnique({
      where: {
        userId_locationId: {
          userId: req.user.id,
          locationId,
        },
      },
    });

    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: 'You have already submitted a review for this location.' });
    }

    const newReview = await prisma.review.create({
      data: {
        content,
        rating: parsedRating,
        user: { connect: { id: req.user.id } },
        location: { connect: { id: locationId } },
      },
      include: {
        user: true,
        location: true,
      },
    });

    res.status(201).json({ success: true, data: newReview });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, async (req: any, res, next) => {
  try {
    const { content, rating } = req.body;

    const existingReview = await prisma.review.findUnique({
      where: { id: req.params['id'] },
    });
    if (!existingReview) {
      throw new Error('Review not found');
    }
    if (existingReview.userId !== req.user.id) {
      res.status(403).json({ success: false, message: 'Not authorized to edit this review' });
      return;
    }

    const parsedRating = rating !== undefined ? Number(rating) : undefined;
    if (
      parsedRating !== undefined &&
      (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5)
    ) {
      return res
        .status(400)
        .json({ success: false, message: 'Rating must be an integer between 1 and 5.' });
    }

    const updatedReview = await prisma.review.update({
      where: { id: req.params['id'] },
      data: {
        content,
        ...(parsedRating !== undefined ? { rating: parsedRating } : {}),
      },
      include: { user: true, location: true },
    });

    res.json({ success: true, data: updatedReview });
  } catch (error) {
    next(error);
  }
});

router.get('/location/:locationId', optionalAuth, async (req: any, res, next) => {
  try {
    const { locationId } = req.params;
    if (!locationId) {
      return res.status(400).json({ success: false, message: 'locationId is required' });
    }

    const limitParam = Number(req.query['limit']);
    const limit = Number.isInteger(limitParam) ? limitParam : 5;
    const safeLimit = Math.min(Math.max(limit, 1), 20);

    const [aggregate, reviews, userReview] = await Promise.all([
      prisma.review.aggregate({
        where: { locationId },
        _avg: { rating: true },
      }),
      prisma.review.findMany({
        where: { locationId },
        orderBy: { createdAt: 'desc' },
        take: safeLimit,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
      }),
      req.user
        ? prisma.review.findUnique({
            where: {
              userId_locationId: {
                userId: req.user.id,
                locationId,
              },
            },
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
            },
          })
        : null,
    ]);

    res.json({
      success: true,
      data: {
        averageRating: aggregate._avg.rating ?? null,
        reviews,
        userReview,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, async (req: any, res, next) => {
  try {
    const existingReview = await prisma.review.findUnique({
      where: { id: req.params['id'] },
    });
    if (!existingReview) {
      throw new Error('Review not found');
    }
    if (existingReview.userId !== req.user.id) {
      res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
      return;
    }

    await prisma.review.delete({
      where: { id: req.params['id'] },
    });

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
