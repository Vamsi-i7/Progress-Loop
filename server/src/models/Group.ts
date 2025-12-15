import mongoose, { Schema, Document } from 'mongoose';

export interface IGroupMember {
    userId: string; // Using string to match frontend ID or can leverage ObjectId
    role: 'owner' | 'admin' | 'member';
    joinedAt: Date;
    name?: string;
    avatar?: string;
    status?: 'online' | 'offline' | 'studying';
}

export interface IPeerGroup extends Document {
    name: string;
    description?: string;
    creatorId: string;
    members: IGroupMember[];
    createdAt: Date;
    settings: { allowInvites: boolean; requireApproval: boolean };
    sharedRoadmaps: string[];
    sharedPlans: string[];
}

const MemberSchema = new Schema({
    userId: { type: String, required: true },
    role: { type: String, enum: ['owner', 'admin', 'member'], default: 'member' },
    joinedAt: { type: Date, default: Date.now },
    name: { type: String },
    avatar: { type: String },
    status: { type: String, default: 'offline' }
});

const GroupSchema: Schema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    creatorId: { type: String, required: true },
    members: [MemberSchema],
    createdAt: { type: Date, default: Date.now },
    settings: {
        allowInvites: { type: Boolean, default: true },
        requireApproval: { type: Boolean, default: false }
    },
    sharedRoadmaps: [{ type: String }],
    sharedPlans: [{ type: String }]
});

export default mongoose.model<IPeerGroup>('PeerGroup', GroupSchema);
