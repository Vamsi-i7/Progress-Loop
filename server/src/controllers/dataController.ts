import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Goal from '../models/Goal';
import Plan from '../models/Plan';
import User from '../models/User';

export const getInitialState = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const [user, goals, plans] = await Promise.all([
            User.findById(userId).select('-passwordHash'),
            Goal.find({ userId }),
            Plan.find({ userId })
        ]);

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.json({
            user,
            goals,
            plans,
            notifications: [], // Implement Notification model later if needed
            scheduledBlocks: [], // Implement generic blocks later
            riskReports: {},
            peerGroups: [], // Separate call usually
            chatHistory: []
        });

    } catch (err: any) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

export const createGoal = async (req: AuthRequest, res: Response) => {
    try {
        const { title, type, category, habits, color } = req.body;
        const newGoal = new Goal({
            userId: req.user.id,
            title,
            type,
            category,
            habits,
            color
        });
        const goal = await newGoal.save();
        res.json(goal);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};

export const toggleHabit = async (req: AuthRequest, res: Response) => {
    try {
        const { goalId, habitId } = req.body;
        const goal = await Goal.findOne({ _id: goalId, userId: req.user.id });

        if (!goal) {
            res.status(404).json({ message: 'Goal not found' });
            return;
        }

        const habit = goal.habits.find(h => h.id === habitId); // Using string ID from frontend
        if (!habit) {
            res.status(404).json({ message: 'Habit not found' });
            return;
        }

        habit.completed = !habit.completed;
        if (habit.completed) {
            habit.streak += 1;
            // Update User XP
            await User.findByIdAndUpdate(req.user.id, { $inc: { xp: 10 } });
        } else {
            habit.streak = Math.max(0, habit.streak - 1);
            await User.findByIdAndUpdate(req.user.id, { $inc: { xp: -10 } });
        }

        // Recalculate progress
        const completedCount = goal.habits.filter(h => h.completed).length;
        goal.progress = Math.round((completedCount / goal.habits.length) * 100);

        await goal.save();
        res.json(goal);

    } catch (err: any) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

export const createPlan = async (req: AuthRequest, res: Response) => {
    try {
        const planData = req.body;
        const newPlan = new Plan({
            ...planData,
            userId: req.user.id
        });
        const plan = await newPlan.save();
        res.json(plan);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};
