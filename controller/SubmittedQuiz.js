import { SubmittedQuiz } from "../models/submittedQuizModel.js";

export const getQuizSubmission = async (req, res) => {
    try {
        const { quizId } = req.query;
        const userId = req.id;

        if (!quizId || !userId) {
            return res.status(400).json({ error: 'Quiz ID and User ID are required.' });
        }

        // Find the quiz submission based on quizId and userId
        const submission = await SubmittedQuiz.findOne({ quizId, userId });

        if (submission) {
            return res.status(200).json({
                success: true,
                message: 'Quiz submission found.',
                submission,
            });
        } else {
            return res.status(200).json({
                success: false,
                message: 'No quiz submission found for this quiz and user.',
            });
        }
    } catch (error) {
        console.error('Error fetching quiz submission:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while fetching the quiz submission.',
        });
    }
};

export const addQuizSubmission = async (req, res) => {
    try {
        const { quizId, totalQuestions, totalMarks, totalPointsObtained, totalNumberObtained, percentage, userName } = req.body;
        const userId = req.id;

        if (!quizId || !userId || !totalQuestions || totalPointsObtained === undefined || !userName) {
            return res.status(400).json({ error: 'All required fields must be provided.' });
        }

        const existingSubmission = await SubmittedQuiz.findOne({ quizId, userId });
        if (existingSubmission) {
            return res.status(400).json({ 
                success: false, 
                message: 'Quiz has already been submitted by this user.' 
            });
        }

        const newSubmission = new SubmittedQuiz({
            userId,
            quizId,
            totalQuestions,
            totalMarks, 
            totalPointsObtained, 
            totalNumberObtained, 
            percentage, 
            userName, 
            submissionTime: new Date()
        });

        await newSubmission.save();

        res.status(201).json({
            success: true,
            message: 'Quiz submission saved successfully.',
            submission: newSubmission
        });
    } catch (error) {
        console.error('Error saving quiz submission:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while saving the quiz submission.',
        });
    }
};
