import mongoose, { Schema, Document } from 'mongoose';

export interface IHabitLog {
    habit_id: string;
    date: string; // YYYY-MM-DD
    status: boolean;
}

export interface IHabit extends Document {
    user_id: string;
    title: string;
    weight: number;
    frequency_goal: number;
}

const HabitSchema: Schema = new Schema({
    user_id: { type: String, required: true, ref: 'User' },
    title: { type: String, required: true },
    weight: { type: Number, default: 1, min: 1, max: 10 },
    frequency_goal: { type: Number, default: 5 }
}, {
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: function (doc: any, ret: any) {
            ret.id = ret._id;
            delete ret._id;
        }
    }
});

// Logs can be a separate collection or embedded. 
// Given the SQL request had a separate table, let's make a separate model for HabitLog to scale naturally.
const HabitLogSchema: Schema = new Schema({
    habit_id: { type: String, required: true, ref: 'Habit' },
    date: { type: String, required: true }, // Format YYYY-MM-DD
    status: { type: Boolean, default: true }
});

// Compound index to prevent duplicate logs for the same day
HabitLogSchema.index({ habit_id: 1, date: 1 }, { unique: true });

export const HabitLog = mongoose.model<IHabitLog & Document>('HabitLog', HabitLogSchema);
export default mongoose.model<IHabit>('Habit', HabitSchema);
