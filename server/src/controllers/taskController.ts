import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Task, { ITask } from '../models/Task';

export const getTasks = async (req: AuthRequest, res: Response) => {
    try {
        const tasks = await Task.find({ user_id: req.user.id }).sort({ due_date: 1 });
        res.json(tasks);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};

export const createTask = async (req: AuthRequest, res: Response) => {
    try {
        const { title, status, priority, energy_level, due_date, do_date, estimated_minutes, subject_tag } = req.body;
        const newTask = new Task({
            user_id: req.user.id,
            title,
            status,
            priority,
            energy_level,
            due_date,
            do_date,
            estimated_minutes,
            subject_tag
        });
        const task = await newTask.save();
        res.json(task);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const task = await Task.findOneAndUpdate(
            { _id: id, user_id: req.user.id },
            { $set: req.body },
            { new: true }
        );
        if (!task) return res.status(404).json({ message: 'Task not found' });
        res.json(task);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const task = await Task.findOneAndDelete({ _id: id, user_id: req.user.id });
        if (!task) return res.status(404).json({ message: 'Task not found' });
        res.json({ message: 'Task removed' });
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};
