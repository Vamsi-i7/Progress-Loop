import express from 'express';
import { getFriends, sendFriendRequest } from '../controllers/userController';
import { auth as authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/friends', authenticateToken, getFriends);
router.post('/friends/request', authenticateToken, sendFriendRequest);

export default router;
