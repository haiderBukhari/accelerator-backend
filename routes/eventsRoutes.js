import express from 'express'
import { addAttendee, createEvent, getUpcomingEvents } from '../controller/EventsController.js';

const eventsRoutes = express.Router();

eventsRoutes.route('/').get(getUpcomingEvents).post(createEvent).patch(addAttendee);

export default eventsRoutes;