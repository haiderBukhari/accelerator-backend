import mongoose from "mongoose";

const friendsSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    friendId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
}, {timestamps: true})

export const friendModel = mongoose.model('friends', friendsSchema)