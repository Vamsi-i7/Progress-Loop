import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    username: string;
    email: string;
    passwordHash: string;
    name: string;
    avatar?: string;
    plan: 'free' | 'pro' | 'premium';
    isVerified: boolean;
    verificationToken?: string;
    joinedDate: Date;
    lastActiveDate: Date;
    xp: number;
    maxXp: number;
    level: number;
    hearts: number;
    streak: number;
    // Advanced AI Extensions
    survivalMode: boolean;
    cognitiveLoadScore: number;
    focusScore: number;

    // Subscription & Quota
    stripeCustomerId?: string;
    subscriptionStatus?: 'active' | 'canceled' | 'past_due';
    subscriptionPeriodEnd?: number;
    aiQuotaLimit: number;
    uploadsLimit: number;

    // Usage tracking
    usage: {
        aiTokensUsed: number;
        uploadsUsed: number;
        lastReset: Date;
    };

    // Social
    friends: string[]; // User IDs
    friendRequests: string[]; // Request IDs
}

const UserSchema: Schema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    avatar: { type: String },
    plan: { type: String, enum: ['free', 'pro', 'premium'], default: 'free' },
    joinedDate: { type: Date, default: Date.now },
    lastActiveDate: { type: Date, default: Date.now },
    // Gamification & Social (New Schema)
    xp_points: { type: Number, default: 0 },
    current_streak: { type: Number, default: 0 },
    study_group_id: { type: String }, // UUID
    mentor_id: { type: String }, // UUID


    // Authentication & Verification
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },

    // Legacy
    xp: { type: Number, default: 0 },
    maxXp: { type: Number, default: 100 },
    level: { type: Number, default: 1 },
    hearts: { type: Number, default: 5 },
    streak: { type: Number, default: 0 },
    survivalMode: { type: Boolean, default: false },
    cognitiveLoadScore: { type: Number, default: 0 },
    focusScore: { type: Number, default: 0 },
    stripeCustomerId: { type: String },
    subscriptionStatus: { type: String },
    subscriptionPeriodEnd: { type: Number },
    aiQuotaLimit: { type: Number, default: 10 },
    uploadsLimit: { type: Number, default: 3 },
    usage: {
        aiTokensUsed: { type: Number, default: 0 },
        uploadsUsed: { type: Number, default: 0 },
        lastReset: { type: Date, default: Date.now }
    },
    friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    friendRequests: [{ type: String }] // Can safely be just IDs for now or ref if we make FriendRequest a model
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

export default mongoose.model<IUser>('User', UserSchema);
