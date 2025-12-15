import mongoose, { Schema, Document } from 'mongoose';

export interface IPlanTask {
    id: string; // Frontend ID
    title: string;
    isCompleted: boolean;
    estimatedMinutes?: number;
    dueDate?: Date;
    subjectWeightage?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    isRevision?: boolean;
    actualTimeSpent?: number;
}

export interface IStudyPlan extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    subject: string;
    startDate: Date;
    endDate: Date;
    priority: 'low' | 'medium' | 'high';
    tasks: IPlanTask[];
}

const TaskSchema = new Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
    estimatedMinutes: { type: Number },
    dueDate: { type: Date },
    subjectWeightage: { type: Number },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
    isRevision: { type: Boolean },
    actualTimeSpent: { type: Number }
});

const StudyPlanSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    subject: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    tasks: [TaskSchema]
});

export default mongoose.model<IStudyPlan>('StudyPlan', StudyPlanSchema);
