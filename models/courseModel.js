import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        default: ''
    }
}, {timestamps: true})

export const CourseModel = mongoose.model('course', courseSchema)