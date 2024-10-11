import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        default: ''
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    }
}, {timestamps: true})

export const CourseModel = mongoose.model('course', courseSchema)