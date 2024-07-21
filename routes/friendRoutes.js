import express from 'express'
import { getFriendList, addFriend } from '../controller/friendController.js';

const friendRoutes = express.Router();

friendRoutes.route('/').get(getFriendList).post(addFriend);

export default friendRoutes;