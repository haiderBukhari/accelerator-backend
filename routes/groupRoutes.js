import express from 'express';
import { createGroup, getGroups, getSpecificGroup } from '../controller/groupController.js';

const groupRoutes = express.Router();

groupRoutes.route('/').get(getGroups).post(createGroup)
groupRoutes.route('/:id').get(getSpecificGroup)

export default groupRoutes