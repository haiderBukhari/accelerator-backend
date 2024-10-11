import express from 'express'
import { addRecoveryEmail, changePassword, getUserData, updateProfileInformation, loginUser, registerUser, updateProfile, getUserRanking, addModerator, getModerators, removeModerator } from '../controller/AuthenticationController.js';
import { verifyAdmin, verifyToken } from '../utils/verifyJWT.js';
import { Storage } from '@google-cloud/storage'
import path from 'path'
import multer from 'multer';
const multerStorage = multer.memoryStorage();
const upload = multer({ storage: multerStorage });
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const keyFilename = path.join(__dirname, '../config/calm-streamer-426319-e8-109e2f187aa1.json');

const storage = new Storage({
    keyFilename: keyFilename,
});
const bucketName = 'profilepictures11';
export const bucket = storage.bucket(bucketName);

const AuthenticationRoutes = express.Router();

AuthenticationRoutes.route('/').post(registerUser).get(loginUser).patch(addRecoveryEmail).put(verifyToken, updateProfile);
AuthenticationRoutes.route('/password').patch(changePassword)
AuthenticationRoutes.route('/ranking').get(getUserRanking)
AuthenticationRoutes.route('/userData').get(verifyToken, getUserData)
AuthenticationRoutes.route('/moderator').get(verifyToken, verifyAdmin, getModerators).post(verifyToken,verifyAdmin, addModerator).delete(verifyToken,verifyAdmin, removeModerator)
AuthenticationRoutes.route('/update').put(verifyToken, upload.single('file'), updateProfileInformation)

export default AuthenticationRoutes;