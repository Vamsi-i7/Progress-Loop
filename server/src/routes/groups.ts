import express from 'express';
import { createGroup, getGroups, sendMessage, getMessages } from '../controllers/groupController';
import { auth } from '../middleware/auth';

const router = express.Router();

router.post('/create', auth, createGroup);
router.get('/', auth, getGroups);
router.post('/message', auth, sendMessage);
router.get('/:groupId/messages', auth, getMessages);

export default router;
