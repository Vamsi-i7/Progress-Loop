import express from 'express';
import { chatWithPro } from '../controllers/aiController';
import { auth } from '../middleware/auth';

const router = express.Router();

router.post('/chat', auth, chatWithPro);

export default router;
