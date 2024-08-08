import { MessagesModel } from "../models/MessageModel.js";
import { throwError } from "../utils/error.js";

export const sendMessage = async (req, res) => {
    try{
        const { fromUserId, toUserId, message } = req.body;
        const newMessage = new MessagesModel({
            senderId: fromUserId,
            receiverId: toUserId,
            message: message
        });
        await newMessage.save();
    }catch(err){
        throwError(res, 400, err.message);
    }
}

export const getAllMessages = async (req, res) => {
    const { secondPersonId } = req.query;
    try {
        const messages = await MessagesModel.find({
            $or: [
                { senderId: req.id, receiverId: secondPersonId },
                { receiverId: req.id, senderId: secondPersonId }
            ]
        }).sort({ "timestamp": 1 });
        res.status(200).json(messages);
    } catch (err) {
        throwError(res, 400, err.message);
    }
}