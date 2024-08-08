import mongoose from 'mongoose'
import { friendModel } from "../models/friendModel.js";

export const getFriends = async (req, res) => {
    const userId = req.id;

    try {
        const friendsDetails = await friendModel.aggregate([
            { 
                $match: { 
                    $or: [
                        { owner: new mongoose.Types.ObjectId(userId) },
                        { friendId: new mongoose.Types.ObjectId(userId) }
                    ], 
                    isfriendAccepted: true 
                } 
            },
            {
                $addFields: {
                    lookupField: {
                        $cond: {
                            if: { $eq: ['$friendId', new mongoose.Types.ObjectId(userId)] },
                            then: '$owner',
                            else: '$friendId'
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'authentications',
                    localField: 'lookupField',
                    foreignField: '_id',
                    as: 'friends'
                }
            },
            { $unwind: '$friends' },
            {
                $project: {
                    _id: 0,
                    friendId: {
                        $cond: {
                            if: { $eq: ['$friendId', new mongoose.Types.ObjectId(userId)] },
                            then: '$owner',
                            else: '$friendId'
                        }
                    },
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
