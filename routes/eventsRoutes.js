import express from 'express'
import { createEvent, getUpcomingEvents } from '../controller/EventsController.js';

const eventsRoutes = express.Router();

eventsRoutes.route('/').get(getUpcomingEvents).post(createEvent);

export default eventsRoutes;