import mongoose from "mongoose";

const PostsSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    name: {
        type: String,
        default: '',
    },
    comment: {
        type: String,
        default: ''
    },
    userImage: {
        type: String,
        default: ''
    },
}, {timestamps: true})

export const PostsModel = mongoose.model('Posts', PostsSchema)