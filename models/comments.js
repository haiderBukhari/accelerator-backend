import mongoose from "mongoose";

const commentsSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
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
    replies: [
        {
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
            }
        }
    ]
}, {timestamps: true})

export const commentsModel = mongoose.model('comments', commentsSchema)