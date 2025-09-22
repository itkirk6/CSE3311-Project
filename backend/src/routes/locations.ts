import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, optionalAuth } from '@/middleware/auth';

const prisma = new PrismaClient();
const router = Router();

// Public routes
router.get('/', optionalAuth, async (_req, res, next) => {
  try {
    const locations = await prisma.location.findMany({
      include: { events: true, activities: true },
    });
    res.json({ success: true, data: locations });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const location = await prisma.location.findUnique({
      where: { id: req.params['id'] },
      include: { events: true, activities: true },
    });

    if (!location) {
      throw new Error('Location not found');
    }

    res.json({ success: true, data: location });
  } catch (error) {
    next(error);
  }
});

// Protected routes
router.post('/', authenticate, async (req, res, next) => {
  try {
    const newLocation = await prisma.location.create({
      data: req.body,
    });
    res.status(201).json({ success: true, data: newLocation });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const updatedLocation = await prisma.location.update({
      where: { id: req.params['id'] },
      data: req.body,
    });
    res.json({ success: true, data: updatedLocation });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    await prisma.location.delete({
      where: { id: req.params['id'] },
    });
    res.json({ success: true, message: 'Location deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
