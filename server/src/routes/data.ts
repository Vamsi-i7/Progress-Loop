import express from 'express';
import { getInitialState, createGoal, toggleHabit, createPlan } from '../controllers/dataController';
import { auth } from '../middleware/auth';

const router = express.Router();

router.get('/sync', auth, getInitialState);
router.post('/goals', auth, createGoal);
router.post('/goals/habit', auth, toggleHabit);
router.post('/plans', auth, createPlan);

export default router;
