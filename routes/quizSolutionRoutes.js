import express from 'express'
import { addQuizSubmission, getQuizSubmission } from '../controller/SubmittedQuiz.js';

const QuizSolutionRoutes = express.Router();

QuizSolutionRoutes.route('/').post(addQuizSubmission).get(getQuizSubmission);

export default QuizSolutionRoutes;