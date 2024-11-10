import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    contactNumber: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    talksAbout: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    groupImage: {
        type: String,
        required: true
    },
    backgroundImage: {
        type: String,
        required: true
    },
    likes: {
        type:Number,
        default: 0
    },
    likeBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    isPrivate: {
        type: Boolean,
        default: false
    },
    joinedUsers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    pendingUsers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
})

export const groups = await new mongoose.model('Groups', groupSchema);