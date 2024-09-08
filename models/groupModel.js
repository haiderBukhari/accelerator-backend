import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Authentication'
    }],
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
    likes: {
        type:Number,
        default: 0
    },
    isPrivate: {
        type: Boolean,
        default: false
    }
})

export const groups = await new mongoose.model('Groups', groupSchema);