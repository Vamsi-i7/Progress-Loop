import mongoose, { Schema, Document } from 'mongoose';

export interface IGroupAttachment {
    id: string;
    name: string;
    url: string;
    type: string;
    size?: number;
    uploadedBy: string;
    uploadedAt: Date;
}

export interface IGroupMessage extends Document {
    groupId: mongoose.Types.ObjectId; // Reference to PeerGroup _id
    senderId: string;
    senderName: string;
    text?: string;
    attachments?: IGroupAttachment[];
    mentions?: string[];
    timestamp: Date;
    isAi?: boolean;
}

const AttachmentSchema = new Schema({
    id: { type: String },
    name: { type: String },
    url: { type: String },
    type: { type: String },
    size: { type: Number },
    uploadedBy: { type: String },
    uploadedAt: { type: Date }
});

const MessageSchema: Schema = new Schema({
    groupId: { type: Schema.Types.ObjectId, ref: 'PeerGroup', required: true },
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    text: { type: String },
    attachments: [AttachmentSchema],
    mentions: [{ type: String }],
    timestamp: { type: Date, default: Date.now },
    isAi: { type: Boolean, default: false }
});

export default mongoose.model<IGroupMessage>('GroupMessage', MessageSchema);
