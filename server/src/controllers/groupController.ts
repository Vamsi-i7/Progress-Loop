import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import PeerGroup from '../models/Group';
import GroupMessage from '../models/Message';
import User from '../models/User';

export const createGroup = async (req: AuthRequest, res: Response) => {
    try {
        const { name, description, settings } = req.body;
        const user = await User.findById(req.user.id);

        const newGroup = new PeerGroup({
            name,
            description,
            creatorId: req.user.id,
            members: [{
                userId: req.user.id,
                name: user?.name,
                role: 'owner',
                joinedAt: new Date(),
                status: 'online'
            }],
            settings
        });

        const group = await newGroup.save();
        res.json(group);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};

export const getGroups = async (req: AuthRequest, res: Response) => {
    try {
        // Find groups where member userId matches
        const groups = await PeerGroup.find({ 'members.userId': req.user.id });
        res.json(groups);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
    try {
        const { groupId, text } = req.body;
        const user = await User.findById(req.user.id);

        const newMessage = new GroupMessage({
            groupId,
            senderId: req.user.id,
            senderName: user?.name || 'Unknown',
            text,
            timestamp: new Date()
        });

        const message = await newMessage.save();

        // Emit Socket Event
        const io = req.app.get('socketio');
        if (io) {
            io.to(groupId).emit('receive_message', message);
        }

        res.json(message);

    } catch (err: any) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

export const getMessages = async (req: AuthRequest, res: Response) => {
    try {
        const { groupId } = req.params;
        const messages = await GroupMessage.find({ groupId }).sort({ timestamp: 1 });
        res.json(messages);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};
