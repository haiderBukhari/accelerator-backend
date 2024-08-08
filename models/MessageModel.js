import mongoose from "mongoose";

const MessagesSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    message: {
        type: String,
        default: ''
    },
}, {timestamps: true})

export const MessagesModel = mongoose.model('Messages', MessagesSchema)