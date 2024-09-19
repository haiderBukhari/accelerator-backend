import mongoose from 'mongoose';
const { Schema } = mongoose;

const submittedQuizSchema = new Schema({
    quizId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the Quiz
        required: true,
        ref: 'Quiz',
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the User
        required: true,
        ref: 'User',
    },
    userName: {
        type: String, // The name of the user who submitted the quiz
        required: true,
    },
    totalQuestions: {
        type: Number, // Total number of questions in the quiz
        required: true,
    },
    totalMarks: {
        type: Number, // Total possible points for the quiz
        required: true,
    },
    totalPointsObtained: {
        type: Number, // Points the user obtained based on correct answers
        required: true,
    },
    totalNumberObtained: {
        type: Number, // Points the user obtained based on correct answers
        required: true,
    },
    percentage: {
        type: Number, // Percentage score (calculated)
        required: true,
    },
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

export const SubmittedQuiz = mongoose.model('SubmittedQuiz', submittedQuizSchema);