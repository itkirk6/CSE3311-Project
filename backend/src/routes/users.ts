import { Router } from 'express';
import { authenticate } from '@/middleware/auth';

const router = Router();

// All user routes are protected
router.use(authenticate);

router.get('/profile', authenticate); // Get user profile
router.put('/profile', authenticate); // Update user profile
router.get('/bookmarks', authenticate); // Get user bookmarks
router.get('/trips', authenticate); // Get user trips

export default router;
