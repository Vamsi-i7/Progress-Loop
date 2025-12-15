import mongoose, { Schema, Document } from 'mongoose';

export interface IHabit {
    id: string; // Keep frontend generated ID or use _id
    title: string;
    completed: boolean;
    streak: number;
}

export interface IGoal extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    type: 'daily' | 'monthly' | 'yearly';
    category: 'short-term' | 'long-term';
    progress: number;
    habits: IHabit[];
    color?: string;
}

const HabitSchema = new Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    streak: { type: Number, default: 0 }
});

const GoalSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    type: { type: String, enum: ['daily', 'monthly', 'yearly'], default: 'daily' },
    category: { type: String, enum: ['short-term', 'long-term'], default: 'short-term' },
    progress: { type: Number, default: 0 },
    habits: [HabitSchema],
    color: { type: String }
});

export default mongoose.model<IGoal>('Goal', GoalSchema);
