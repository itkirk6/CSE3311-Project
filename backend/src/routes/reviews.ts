import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, optionalAuth } from '@/middleware/auth';

const prisma = new PrismaClient();
const router = Router();

const reviewUserSelect = {
  id: true,
  username: true,
  firstName: true,
  lastName: true,
};

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

router.get('/location/:locationId', optionalAuth, async (req: any, res, next) => {
  try {
    const { locationId } = req.params;

    const [recentReviews, summary] = await Promise.all([
      prisma.review.findMany({
        where: { locationId },
        include: { user: { select: reviewUserSelect } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.review.aggregate({
        where: { locationId },
        _avg: { rating: true },
        _count: { _all: true },
      }),
    ]);

    const userReview = req.user
      ? await prisma.review.findUnique({
          where: {
            userId_locationId: { userId: req.user.id, locationId },
          },
          include: { user: { select: reviewUserSelect } },
        })
      : null;

    res.json({
      success: true,
      data: {
        averageRating: summary._avg.rating ?? null,
        reviewCount: summary._count?._all ?? 0,
        reviews: recentReviews,
        userReview,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Protected routes
router.post('/', authenticate, async (req: any, res, next) => {
  try {
    const { content, rating, locationId } = req.body as {
      content?: string;
      rating?: number | string;
      locationId?: string;
    };

    if (!locationId) {
      res.status(400).json({ success: false, message: 'locationId is required' });
      return;
    }

    const parsedRating = Number(rating);
    if (!Number.isFinite(parsedRating)) {
      res.status(400).json({ success: false, message: 'Rating must be a number' });
      return;
    }
    const normalizedRating = Math.round(parsedRating);
    if (normalizedRating < 1 || normalizedRating > 5) {
      res
        .status(400)
        .json({ success: false, message: 'Rating must be between 1 and 5 stars' });
      return;
    }

    const trimmedContent = typeof content === 'string' ? content.trim() : '';
    if (!trimmedContent) {
      res.status(400).json({ success: false, message: 'Review content is required' });
      return;
    }

    const existingReview = await prisma.review.findUnique({
      where: {
        userId_locationId: {
          userId: req.user.id,
          locationId,
        },
      },
    });

    if (existingReview) {
      res
        .status(409)
        .json({ success: false, message: 'You have already reviewed this location' });
      return;
    }

    const newReview = await prisma.review.create({
      data: {
        content: trimmedContent,
        rating: normalizedRating,
        user: { connect: { id: req.user.id } },
        location: { connect: { id: locationId } },
      },
      include: { user: { select: reviewUserSelect } },
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

    const updatedReview = await prisma.review.update({
      where: { id: req.params['id'] },
      data: { content, rating },
      include: { user: true, location: true },
    });

    res.json({ success: true, data: updatedReview });
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
