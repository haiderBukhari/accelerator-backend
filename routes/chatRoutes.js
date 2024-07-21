import express from 'express'
import {getFriends} from '../controller/ChatController.js' 

const chatRoutes = express.Router();

chatRoutes.route('/friends').get(getFriends);

export default chatRoutes;