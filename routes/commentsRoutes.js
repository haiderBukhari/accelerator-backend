import express from 'express'
import { createComment, createReply, getCommentsByPostId } from '../controller/commentsController.js';

const commentsRoutes = express.Router();

commentsRoutes.route('/').get(getCommentsByPostId).post(createComment).patch(createReply);

export default commentsRoutes;