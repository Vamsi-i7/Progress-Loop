import mongoose, { Schema, Document } from 'mongoose';

export interface INode {
    id: string;
    title: string;
    content: string;
    parentId?: string;
    level: number;
    estimatedMinutes?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    weight?: number;
    summaryOverview?: string;
    summaryDetailed?: string;
}

export interface IRoadmap extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    nodes: INode[];
    generatedAt: Date;
}

const NodeSchema = new Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String },
    parentId: { type: String },
    level: { type: Number },
    estimatedMinutes: { type: Number },
    difficulty: { type: String },
    weight: { type: Number },
    summaryOverview: { type: String },
    summaryDetailed: { type: String }
});

const RoadmapSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    nodes: [NodeSchema],
    generatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<IRoadmap>('Roadmap', RoadmapSchema);
