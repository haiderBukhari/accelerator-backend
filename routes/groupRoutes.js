import express from 'express';
import { addBackgroundPicture, addProfilePicture, approvePendingUser, createGroup, deleteSpecificGroup, getGroups, getGroupUsers, getJoinedGroupDetails, getLikedUsers, getSpecificGroup, joinGroup, likeGroup, removeUser, toggleGroupPrivacy, togglePin, updateGroupDetails } from '../controller/groupController.js';
import { Storage } from '@google-cloud/storage';
import path from 'path';
import multer from 'multer';
const multerStorage = multer.memoryStorage();
const upload = multer({ storage: multerStorage });
import { fileURLToPath } from 'url';

const groupRoutes = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const keyFilename = path.join(__dirname, '../config/calm-streamer-426319-e8-109e2f187aa1.json');
const storage = new Storage({
    keyFilename: keyFilename,
});
const bucketName = 'groups-data-101';
export const bucket = storage.bucket(bucketName);

groupRoutes.route('/').get(getGroups).post(upload.single('file'), createGroup).patch(joinGroup).put(updateGroupDetails)
groupRoutes.route('/picture').patch(upload.single('file'), addProfilePicture).put(upload.single('file'), addBackgroundPicture)
groupRoutes.route('/allusers').get(getGroupUsers)
groupRoutes.route('/likedusers').get(getLikedUsers)
groupRoutes.route('/joined-groups').get(getJoinedGroupDetails).patch(toggleGroupPrivacy).put(approvePendingUser).delete(removeUser)
groupRoutes.route('/:id').get(getSpecificGroup).put(likeGroup).patch(togglePin).delete(deleteSpecificGroup)

export default groupRoutes