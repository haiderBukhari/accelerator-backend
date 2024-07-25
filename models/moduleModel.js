import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    name: {
        type: String,
        default: '',
        required: true
    },
    descriptionShort:{
        type: String,
        default: '',
        required: true
    },
    descriptionLong:{
        type: String,
        default: '',
        required: true
    },
    imageLink: {
        type: String,
        default: '',
        required: true
    },
    videoLink: {
        type: String,
        default: '',
    }, 
    views: {
        type:Number,
        default: 0,
    }
}, {timestamps: true})

export const modulesModel = mongoose.model('modules', moduleSchema)