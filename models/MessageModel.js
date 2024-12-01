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
    status: {
        type: String,
        enum: ['delivered', 'read'],
        default: 'delivered', // initial state when the message is sent
    },
}, {timestamps: true})

export const MessagesModel = mongoose.model('Messages', MessagesSchema)
