import express from 'express';
import { createFolder, createFolderImage, getGroupFolders, getGroupFoldersImages, getGroupUsers } from '../controller/groupController.js';
import { Storage } from '@google-cloud/storage';
import path from 'path';
import multer from 'multer';
const multerStorage = multer.memoryStorage();
const upload = multer({ storage: multerStorage });
import { fileURLToPath } from 'url';

const groupFolderRoutes = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const keyFilename = path.join(__dirname, '../config/calm-streamer-426319-e8-109e2f187aa1.json');
const storage = new Storage({
    keyFilename: keyFilename,
});
const bucketName = 'groups-data-101';
export const bucket = storage.bucket(bucketName);

groupFolderRoutes.route('/').get(getGroupFolders).post(upload.single('file'), createFolder)
groupFolderRoutes.route('/images').get(getGroupFoldersImages).post(upload.single('file'), createFolderImage)

export default groupFolderRoutes