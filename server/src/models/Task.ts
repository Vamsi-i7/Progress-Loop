import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
    user_id: string; // UUID
    title: string;
    status: 'Not Started' | 'In Progress' | 'Blocked' | 'Reviewing' | 'Done';
    priority: 'High' | 'Medium' | 'Low';
    energy_level: 'High Focus' | 'Low Energy';
    due_date: Date;
    do_date?: Date;
    estimated_minutes: number;
    actual_minutes: number;
    subject_tag: string;
    is_missed: boolean;
}

const TaskSchema: Schema = new Schema({
    user_id: { type: String, required: true, ref: 'User' }, // Reference User by UUID/String ID
    title: { type: String, required: true },
    status: {
        type: String,
        enum: ['Not Started', 'In Progress', 'Blocked', 'Reviewing', 'Done'],
        default: 'Not Started'
    },
    priority: {
        type: String,
        enum: ['High', 'Medium', 'Low'],
        default: 'Medium'
    },
    energy_level: {
        type: String,
        enum: ['High Focus', 'Low Energy'],
        default: 'High Focus'
    },
    due_date: { type: Date, required: true },
    do_date: { type: Date },
    estimated_minutes: { type: Number, default: 0 },
    actual_minutes: { type: Number, default: 0 },
    subject_tag: { type: String, required: true },
    is_missed: { type: Boolean, default: false }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: function (doc: any, ret: any) {
            ret.id = ret._id;
            delete ret._id;
        }
    }
});

export default mongoose.model<ITask>('Task', TaskSchema);
