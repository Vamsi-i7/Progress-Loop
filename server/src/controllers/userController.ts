import { Request, Response } from 'express';
import User from '../models/User';

export const getFriends = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.userId;
        const user = await User.findById(userId).populate('friends', 'name avatar xp_points level lastActiveDate');

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json(user.friends);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const sendFriendRequest = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const fromUserId = req.user.userId;
        const { toUserId } = req.body;

        if (fromUserId === toUserId) {
            return res.status(400).json({ message: 'Cannot friend yourself' });
        }

        const targetUser = await User.findById(toUserId);
        if (!targetUser) return res.status(404).json({ message: 'User not found' });

        // Logic to add to friendRequests or auto-add if simplified
        // specific requirements might need FriendRequest model. 
        // For now, let's just push to friendRequests array in User model

        if (!targetUser.friendRequests.includes(fromUserId)) {
            targetUser.friendRequests.push(fromUserId);
            await targetUser.save();
        }

        res.json({ message: 'Friend request sent' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
