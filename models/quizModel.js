// models/Quiz.js

import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
    option: { type: String, required: true },
    isCorrect: { type: Boolean, default: false }
});

const questionSchema = new mongoose.Schema({
    qns: { type: String, required: true },
    options: {
        option1: { type: optionSchema, required: true },
        option2: { type: optionSchema, required: true },
        option3: { type: optionSchema, required: false }, // optional extra options
        option4: { type: optionSchema, required: false }
    }
});

const quizSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course', // Reference to the Course model
        required: true
    },
    title: {
        type: String,
        required: true
    },
    questions: [questionSchema],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export const Quiz = mongoose.model('Quiz', quizSchema);

