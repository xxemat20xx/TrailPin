import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { getProfile, updateProfile } from '../controllers/profile.controller';

const router = Router();
router.use(authenticate);

router.get('/', getProfile);
router.put('/', updateProfile);

export default router;