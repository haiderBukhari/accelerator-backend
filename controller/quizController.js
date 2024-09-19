// controllers/quizController.js

import { Quiz } from "../models/quizModel.js";

export const addQuiz = async (req, res) => {
    const { courseId, title, questions } = req.body;
    console.log(courseId, title, questions)

    try {
        // Create new quiz
        const newQuiz = new Quiz({
            courseId,
            title,
            questions
        });

        await newQuiz.save();

        res.status(201).json({ message: 'Quiz created successfully', quiz: newQuiz });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Server error, could not create quiz' });
    }
};