import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Habit, { HabitLog } from '../models/Habit';

// --- HABITS ---
export const getHabits = async (req: AuthRequest, res: Response) => {
    try {
        const habits = await Habit.find({ user_id: req.user.id });
        // Fetch logs for today or recent range? For now, fetch all logs for these habits
        // Optimization: In a real app, maybe only fetch last 30 days logs
        // For Dashboard heatmap, we might need a separate call.
        res.json(habits);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};

export const createHabit = async (req: AuthRequest, res: Response) => {
    try {
        const { title, weight, frequency_goal } = req.body;
        const newHabit = new Habit({
            user_id: req.user.id,
            title,
            weight,
            frequency_goal
        });
        const habit = await newHabit.save();
        res.json(habit);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};

// --- LOGS ---
export const logHabit = async (req: AuthRequest, res: Response) => {
    try {
        const { habitId, date, status } = req.body;
        // Verify ownership
        const habit = await Habit.findOne({ _id: habitId, user_id: req.user.id });
        if (!habit) return res.status(404).json({ message: 'Habit not found' });

        const log = await HabitLog.findOneAndUpdate(
            { habit_id: habitId, date },
            { status },
            { upsert: true, new: true }
        );
        res.json(log);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};

export const getHabitLogs = async (req: AuthRequest, res: Response) => {
    try {
        const userHabits = await Habit.find({ user_id: req.user.id }).select('_id');
        const habitIds = userHabits.map(h => h._id.toString());
        const logs = await HabitLog.find({ habit_id: { $in: habitIds } });
        res.json(logs);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};
