import express from 'express'
import { addQuiz } from '../controller/quizController.js';
import { getQuiz } from '../controller/coursesController.js';

const QuizRoutes = express.Router();

QuizRoutes.route('/').post(addQuiz).get(getQuiz);

export default QuizRoutes;