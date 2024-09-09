import mongoose from "mongoose";

const groupFolderSchema = new mongoose.Schema({
    folderImage: {
        type: String,
        default: ''
    },
    name: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
}, { timestamps: true });

export const groupsFolders = mongoose.model('GroupFolder', groupFolderSchema);