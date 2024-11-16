import mongoose from "mongoose";

const PostsSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    isPinedPost: {
        type: Boolean,
        default: false
    },
    text: {
        type: String,
        default: ''
    },
    imageUrl: {
        type: String,
        default: ''
    },
    videoUrl: {
        type: String,
        default: '',
    },
    likes: {
        type: Number,
        default: 0
    },
    likeBy: [
        {
            type: mongoose.Schema.Types.ObjectId, // Now this is an array of ObjectId
            ref: 'User' // Assuming you have a User model
        }
    ],
    savedBy: [
        {
            type: mongoose.Schema.Types.ObjectId, // Now this is an array of ObjectId
            ref: 'User' // Assuming you have a User model
        }
    ],
    comments: {
        type: Number,
        default: 0    
    },
    shares: {
        type: Number,
        default: 0    
    },
    isGroupPost: {
        type: Boolean,
        default: false      
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        default: null
    }
}, {timestamps: true});

export const PostsModel = mongoose.model('Posts', PostsSchema)