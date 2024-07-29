import { EventModel } from "../models/eventsModel.js";
import { throwError } from "../utils/error.js";

export const createEvent = async (req, res) => {
    try {
        const { name, description, startDate, endDate, eventType, address, joiningLink } = req.body;
        if (!name || !description || !startDate || !endDate || !eventType) {
            throw new Error("Alll Fields are Required");
        }
        const data = await EventModel.create({
            name,
            description,
            startDate,
            endDate,
            eventType,
            address,
            joiningLink
        })
        res.status(200).json({
            message: "Event Created Successfully",
            events: data
        })
    } catch (err) {
        throwError(res, 400, err.message);
    }
}

export const getUpcomingEvents = async (req, res) => {
    console.log(req.id);
    try {
        const today = new Date();
        const events = await EventModel.find({ endDate: { $gt: today } });

        // Check if the user is attending each event
        const updatedEvents = events.map(event => ({
            ...event.toObject(),
            attending: event.attendingPeoples.includes(req.id)
        }));

        res.status(200).json({
            message: "Upcoming Events Retrieved Successfully",
            events: updatedEvents
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

export const addAttendee = async (req, res) => {
    const eventId = req.query.id;
    const attendeeId = req.id;
    try {
        const events = await EventModel.findById(eventId);
        if (!events) throw new Error("Event not found");
        events.attendingPeoples.push(attendeeId);
        await events.save();
        res.status(200).json({
            events: {...events, attending: true},
        });
    } catch (err) {
        throwError(res, 400, err.message);
    }
}