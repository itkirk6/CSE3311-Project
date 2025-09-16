import { Router } from 'express';
import { authenticate, optionalAuth } from '@/middleware/auth';

const router = Router();

// Public routes
router.get('/', optionalAuth); // Get all events
router.get('/:id', optionalAuth); // Get event by ID

// Protected routes
router.post('/', authenticate); // Create event
router.put('/:id', authenticate); // Update event
router.delete('/:id', authenticate); // Delete event

export default router;
