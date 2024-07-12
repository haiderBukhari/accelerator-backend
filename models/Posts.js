import mongoose from "mongoose";

const PostsSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
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
        required: '',
    },
    likes: {
        type: Number,
        default: 0
    },
    comments: {
        type: Number,
        default: 0    
    },
    shares: {
        type: Number,
        default: 0    
    }
})

export const PostsModel = mongoose.model('Posts', PostsSchema)