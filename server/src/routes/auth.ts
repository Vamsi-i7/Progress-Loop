import express from 'express';
import { register, login, getMe, updateUser, verifyEmail } from '../controllers/authController';
import { auth as authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, getMe);
router.put('/me', authenticateToken, updateUser);
router.post('/verify', verifyEmail);

export default router;
