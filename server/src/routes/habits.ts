import express from 'express';
import { getHabits, createHabit, logHabit, getHabitLogs } from '../controllers/habitController';
import { auth } from '../middleware/auth';

const router = express.Router();

router.get('/', auth, getHabits);
router.post('/', auth, createHabit);
router.get('/logs', auth, getHabitLogs);
router.post('/log', auth, logHabit);

export default router;
