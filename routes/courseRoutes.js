import express from 'express'
import { addCourse, deleteCourse, getCourseModule, getCourses, getModule, markAsCompleted, tripVideo, uploadModule } from '../controller/coursesController.js';
import { Storage } from '@google-cloud/storage';
import path from 'path';
import multer from 'multer';
const multerStorage = multer.memoryStorage();
const upload = multer({ storage: multerStorage });
import { fileURLToPath } from 'url';

const courseRoutes = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const keyFilename = path.join(__dirname, '../config/calm-streamer-426319-e8-109e2f187aa1.json');
const storage = new Storage({
    keyFilename: keyFilename,
});
const bucketName = 'groups-data-101';
export const bucket = storage.bucket(bucketName);
const uploadMultiple = upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'file1', maxCount: 1 },
]);

courseRoutes.route('/').get(getCourses).post(addCourse).delete(deleteCourse);
courseRoutes.route('/modules').get(getCourseModule).post(uploadMultiple, uploadModule);
courseRoutes.route('/modules/:id').get(getModule).patch(markAsCompleted).put(tripVideo);

export default courseRoutes;