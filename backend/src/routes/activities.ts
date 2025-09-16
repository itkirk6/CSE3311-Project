import { Router } from 'express';
import { authenticate, optionalAuth } from '@/middleware/auth';

const router = Router();

// Public routes
router.get('/', optionalAuth); // Get all activities
router.get('/:id', optionalAuth); // Get activity by ID

// Protected routes
router.post('/', authenticate); // Create activity
router.put('/:id', authenticate); // Update activity
router.delete('/:id', authenticate); // Delete activity

export default router;
