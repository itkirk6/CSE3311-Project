import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, optionalAuth } from '@/middleware/auth';

const prisma = new PrismaClient();
const router = Router();

// Public routes
router.get('/', optionalAuth, async (_req, res, next) => {
  try {
    const events = await prisma.event.findMany({
      include: { location: true },
    });
    res.json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params['id'] },
      include: { location: true},
    });

    if (!event) {
      throw new Error('Event not found');
    }

    res.json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
});

// Protected routes
router.post('/', authenticate, async (req, res, next) => {
  try {
    const newEvent = await prisma.event.create({
      data: req.body,
    });
    res.status(201).json({ success: true, data: newEvent });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const updatedEvent = await prisma.event.update({
      where: { id: req.params['id'] },
      data: req.body,
    });
    res.json({ success: true, data: updatedEvent });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    await prisma.event.delete({
      where: { id: req.params['id'] },
    });
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
