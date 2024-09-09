import { friendModel } from "../models/friendModel.js";
import { AuthenticationModel } from "../models/AuthenticationModel.js";
import { throwError } from "../utils/error.js";
import mongoose from "mongoose";
import { NotificationsModel } from "../models/notificationModel.js";

export const getFriendList = async (req, res) => {
    const { currentPage, name } = req.query;
    const pageSize = 8;
    const skip = (currentPage - 1) * pageSize;

    try {
        // Fetch friends
        const friends = await friendModel.find({
            $or: [
                { owner: new mongoose.Types.ObjectId(req.id) },
                { friendId: new mongoose.Types.ObjectId(req.id) }
            ]
        });

        const friendIds = friends?.map(friend => friend.friendId.toString() === req.id ? friend.owner : friend.friendId);
        
        // Build query object
        let query = {
            _id: { $ne: req.id, $nin: friendIds },
            isAdmin: false
        };

        // Add name filter if name query parameter is present
        if (name) {
            query = {
                ...query,
                $or: [
                    { firstName: { $regex: new RegExp(name, 'i') } },
                    { lastName: { $regex: new RegExp(name, 'i') } }
                ]
            };
        }

        // Count total documents with the given query
        const documentList = await AuthenticationModel.countDocuments(query);

        // Fetch the list of users based on the query with pagination
        const nonFriends = await AuthenticationModel.find(query, {
            _id: 1,
            firstName: 1,
            lastName: 1,
            aboutMe: 1,
            profilePicture: 1
        }).skip(skip).limit(pageSize);

        // Count pending friends
        const pendingFriends = await friendModel.countDocuments({
            friendId: new mongoose.Types.ObjectId(req.id),
            isfriendAccepted: false
        });

        res.status(200).json({
            total: documentList,
            nonFriends: nonFriends,
            pendingFriends: pendingFriends
        });
    } catch (err) {
        throwError(res, 400, err.message);
    }
};

export const addFriend = async (req, res) => {
    const { id } = req.body;
    try {
        if (!id) throw new Error("Friend Id is Required")
        const friend = await friendModel.find({ owner: req.id, friendId: id });
        if (friend.length) throw new Error("Friend already exists");
        await friendModel.create({ owner: req.id, friendId: id });
        const friendData = await AuthenticationModel.findById(req.id);
        await NotificationsModel.create({
            userId: id,
            message: `${friendData.firstName} ${friendData.lastName} sent you a friend request`,
            createdAt: new Date()
        })
        res.status(200).json({
            message: "Friend Added"
        })
    } catch (err) {
        throwError(res, 400, err.message);
    }
}

export const acceptFriendRequest = async (req, res) => {
    try {
        const { owner, friendId } = req.body;
        const data = await friendModel.findOneAndUpdate({ owner: owner, friendId: friendId }, { isfriendAccepted: true }, { new: true });
        res.status(200).json({
            message: "Friend Request Accepted",
            data: data
        })
    } catch (err) {
        throwError(res, 400, err.message);
    }
}

export const declineFriendRequest = async (req, res) => {
    try {
        const { owner, friendId } = req.query;
        await friendModel.findOneAndDelete({ owner: owner, friendId: friendId }, { isfriendAccepted: true });
        res.status(200).json({
            message: "Friend Request Accepted",
        })
    } catch (err) {
        throwError(res, 400, err.message);
    }
}

export const getunAcceptedFriends = async (req, res) => {
    try {
        const friends = await friendModel.aggregate([
            { $match: { friendId: new mongoose.Types.ObjectId(req.id), isfriendAccepted: false } },
            {
                $lookup: {
                    from: 'authentications',
                    localField: 'owner',
                    foreignField: '_id',
                    as: 'friendDetails'
                }
            },
            { $unwind: '$friendDetails' },
            {
                $project: {
                    _id: 1,
                    owner: 1,
                    friendId: 1,
                    isfriendAccepted: 1,
                    latestMessage: 1,
                    notifications: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    'friendDetails.firstName': 1,
                    'friendDetails.lastName': 1,
                    'friendDetails.profilePicture': 1
                }
            }
        ]);

        res.status(200).json({
            message: "Friend Request Accepted",
            friends: friends
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};