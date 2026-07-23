import { Router } from 'express';
import {
    register,
    verifyEmail,
    login,
    getMe,
    googleRedirect,
    googleCallback,
    logout,
    getAllUsers
} from '../controllers/auth.controller'
import { authenticate } from '../middleware/auth.middleware';

const router = Router();


router.post('/register', register);
router.get('/verify-email', verifyEmail); //get because its a simple click to 
router.post('/login', login);

// google
router.get('/google', googleRedirect);
router.get('/google/callback', googleCallback);

// authenticated routes
router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, logout);

router.get('/users', getAllUsers);

export default router;