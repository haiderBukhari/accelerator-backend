import express from 'express'
import { Storage } from '@google-cloud/storage'
import path from 'path'
import multer from 'multer';
const PostsRoutes = express.Router();
const multerStorage = multer.memoryStorage();
const upload = multer({ storage: multerStorage });
import { fileURLToPath } from 'url';
import { uploadPost } from '../controller/postsController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const keyFilename = path.join(__dirname, '../config/calm-streamer-426319-e8-109e2f187aa1.json');

const storage = new Storage({
    keyFilename: keyFilename,
});
const bucketName = 'groups-data-101';
export const bucket = storage.bucket(bucketName);

PostsRoutes.post('/upload', upload.single('file'), uploadPost);


export default PostsRoutes;