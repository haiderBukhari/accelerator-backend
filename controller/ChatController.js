import mongoose from 'mongoose'
import { friendModel } from "../models/friendModel.js";

export const getFriends = async (req, res) => {
    const userId = req.id;

    try {
        const friendsDetails = await friendModel.aggregate([
            { $match: { $or: [
                { owner: new mongoose.Types.ObjectId(userId) },
                { friendId: new mongoose.Types.ObjectId(userId) }
            ], isfriendAccepted: true } },
            {
                $lookup: {
                    from: 'authentications',
                    localField: 'friendId',
                    foreignField: '_id',
                    as: 'friends'
                }
            },
            { $unwind: '$friends' },
            {
                $project: {
                    _id: 0,
                    friendId: '$friendId',
                    firstName: '$friends.firstName',
                    lastName: '$friends.lastName',
                    photo: '$friends.profilePicture',
                    latestMessage: '$latestMessage',
                    notifications: '$notifications'
                }
            }
        ]);

        res.status(200).json(friendsDetails);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};