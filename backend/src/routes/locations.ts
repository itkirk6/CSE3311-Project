import { Router } from 'express';
import { authenticate, optionalAuth } from '@/middleware/auth';

const router = Router();

// Public routes
router.get('/', optionalAuth); // Get all locations with optional auth for personalized results
router.get('/:id', optionalAuth); // Get location by ID

// Protected routes
router.post('/', authenticate); // Create location (admin only)
router.put('/:id', authenticate); // Update location (admin only)
router.delete('/:id', authenticate); // Delete location (admin only)

export default router;
