import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, optionalAuth } from '@/middleware/auth';

const prisma = new PrismaClient();
const router = Router();

// Public routes
router.get('/', optionalAuth, async (_req, res, next) => {
  try {
    const activities = await prisma.activity.findMany();
    res.json({ success: true, data: activities });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const activity = await prisma.activity.findUnique({
      where: { id: req.params['id'] },
      include: { location: true },
    });

    if (!activity) {
      // For now just throw, errorHandler will turn it into a 500
      throw new Error('Activity not found');
    }

    res.json({ success: true, data: activity });
  } catch (error) {
    next(error);
  }
});

// Protected routes
router.post('/', authenticate, async (req, res, next) => {
  try {
    const newActivity = await prisma.activity.create({
      data: req.body,
    });
    res.status(201).json({ success: true, data: newActivity });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const updatedActivity = await prisma.activity.update({
      where: { id: req.params['id'] },
      data: req.body,
    });
    res.json({ success: true, data: updatedActivity });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    await prisma.activity.delete({
      where: { id: req.params['id'] },
    });
    res.json({ success: true, message: 'Activity deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
