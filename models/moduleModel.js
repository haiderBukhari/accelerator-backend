import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema({
    title: {
        type: String,
        default: ''
    },
}, {timestamps: true})

export const modulesModel = mongoose.model('modules', moduleSchema)