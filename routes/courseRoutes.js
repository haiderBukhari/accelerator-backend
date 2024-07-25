import express from 'express'
import { addCourse } from '../controller/coursesController.js';

const courseRoutes = express.Router();

courseRoutes.route('/courses').post(addCourse);

export default courseRoutes;