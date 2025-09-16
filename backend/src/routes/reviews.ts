import { Router } from 'express';
import { authenticate, optionalAuth } from '@/middleware/auth';

const router = Router();

// Public routes
router.get('/', optionalAuth); // Get reviews

// Protected routes
router.post('/', authenticate); // Create review
router.put('/:id', authenticate); // Update review
router.delete('/:id', authenticate); // Delete review

export default router;
