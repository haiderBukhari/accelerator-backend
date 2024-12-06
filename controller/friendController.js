import { friendModel } from "../models/friendModel.js";
import { AuthenticationModel } from "../models/AuthenticationModel.js";
import { throwError } from "../utils/error.js";
import mongoose from "mongoose";
import { NotificationsModel } from "../models/notificationModel.js";

export const getFriendList = async (req, res) => {
    const { currentPage, name, location, industry } = req.query;
    const pageSize = 8;
    const skip = (currentPage - 1) * pageSize;

    try {
        // Find all friend relationships for the current user
        const friends = await friendModel.find({
            $or: [
                { owner: new mongoose.Types.ObjectId(req.id) },
                { friendId: new mongoose.Types.ObjectId(req.id) }
            ]
        });

        // Create maps to store friendship and request status
        const friendMap = {};
        const requestMap = {};

        friends.forEach(friend => {
            const isOwner = friend.owner.toString() === req.id;
            const otherId = isOwner ? friend.friendId.toString() : friend.owner.toString();

            if (friend.isfriendAccepted) {
                friendMap[otherId] = true; // Mark as friend
            } else {
                if (isOwner) {
                    requestMap[otherId] = "isFriendRequestSent"; // Friend request sent by current user
                } else {
                    requestMap[otherId] = "noAcceptFriendRequest"; // Friend request received by current user
                }
            }
        });

        // Build the query object
        let query = {
            _id: { $ne: req.id },
        };

        // Filter by name if provided
        if (name) {
            const nameParts = name.trim().split(' '); // Split the input by spaces

            if (nameParts.length === 2) {
                const [firstNamePart, lastNamePart] = nameParts;

                query = {
                    ...query,
                    $or: [
                        {
                            $and: [
                                { firstName: { $regex: new RegExp(firstNamePart, 'i') } },
                                { lastName: { $regex: new RegExp(lastNamePart, 'i') } }
                            ]
                        },
                        { email: { $regex: new RegExp(name, 'i') } }
                    ]
                };
            } else {
                const singleNameRegex = new RegExp(nameParts[0], 'i');

                query = {
                    ...query,
                    $or: [
                        { firstName: { $regex: singleNameRegex } },
                        { lastName: { $regex: singleNameRegex } },
                        { email: { $regex: singleNameRegex } }
                    ]
                };
            }
        }

        // Filter by location if provided
        if (location) {
            query = {
                ...query,
                location: { $regex: new RegExp(location, 'i') }
            };
        }

        // Filter by industry if provided
        if (industry) {
            query = {
                ...query,
                industry: { $regex: new RegExp(industry, 'i') }
            };
        }

        const documentList = await AuthenticationModel.countDocuments(query);

        // Fetch the list of users based on the query with pagination
        const users = await AuthenticationModel.find(query, {
            _id: 1,
            firstName: 1,
            lastName: 1,
            aboutMe: 1,
            profilePicture: 1
        }).skip(skip).limit(pageSize);

        // Add friendship status to each user
        const nonFriends = users.map(user => {
            const userId = user._id.toString();
            return {
                ...user.toObject(),
                isFriend: friendMap[userId] || false,
                isFriendRequestSent: requestMap[userId] === "isFriendRequestSent",
                noAcceptFriendRequest: requestMap[userId] === "noAcceptFriendRequest"
            };
        });

        // Count pending friend requests received by the user
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
        res.status(400).json({ error: err.message });
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
        await friendModel.findOneAndDelete({ $or: [
            {
                owner: owner, friendId: friendId
            },
            {
                owner: friendId, friendId: owner 
            }
        ] }, { isfriendAccepted: true });
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