import express from 'express'
import { getFriendList, addFriend, acceptFriendRequest, getunAcceptedFriends, declineFriendRequest } from '../controller/friendController.js';

const friendRoutes = express.Router();

friendRoutes.route('/').get(getFriendList).post(addFriend).patch(acceptFriendRequest).delete(declineFriendRequest);
friendRoutes.route('/not-accepted').get(getunAcceptedFriends);

export default friendRoutes;