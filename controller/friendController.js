import { friendModel } from "../models/friendModel.js";
import { AuthenticationModel } from "../models/AuthenticationModel.js";
import { throwError } from "../utils/error.js";
export const getFriendList = async (req, res) => {
    const {currentPage} = req.query;
    const pageSize = 8;
    const skip = (currentPage - 1) * pageSize;

    try{
        const friends =  await friendModel.find({owner: req.id});
        const friendIds = friends?.map(friend => friend.friendId);
        const documentList = await AuthenticationModel.countDocuments({ 
            _id: { $ne: req.id, $nin: friendIds }, 
            isAdmin: false
        });

        const nonFriends = await AuthenticationModel.find({ 
            _id: { $ne: req.id, $nin: friendIds }, 
            isAdmin: false
        }, {_id: 1, firstName:1, lastName: 1, aboutMe:1, profilePicture:1}).skip(skip).limit(pageSize);

        res.status(200).json({
            total: documentList,
            nonFriends: nonFriends
        })
    } catch (err) {
        throwError(res, 400, err.message);
    }
}

export const addFriend = async (req, res) => {
    const {id} = req.body;
    try{
        if(!id) throw new Error("Friend Id is Required")
        const friend =  await friendModel.find({owner: req.id, friendId: id });
        if(friend.length) throw new Error("Friend already exists");
        await friendModel.create({owner: req.id, friendId: id});
        res.status(200).json({
            message: "Friend Added"
        })
    }catch (err) {
        throwError(res, 400, err.message);
    }
}