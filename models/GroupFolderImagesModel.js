import mongoose from "mongoose";

const groupFolderImagesSchema = new mongoose.Schema({
    image: {
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
    folderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
}, { timestamps: true });

export const groupsFoldersImages = mongoose.model('GroupFolderImages', groupFolderImagesSchema);