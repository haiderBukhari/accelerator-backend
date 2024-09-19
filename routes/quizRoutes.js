import express from 'express'
import { addQuiz } from '../controller/quizController.js';

const QuizRoutes = express.Router();

QuizRoutes.route('/').post(addQuiz);

export default QuizRoutes;