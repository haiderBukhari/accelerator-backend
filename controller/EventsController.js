import { EventModel } from "../models/eventsModel.js";
import { throwError } from "../utils/error.js";

export const createEvent = async (req, res) => {
    try {
        const {name, description, startDate, endDate, eventType, address, joiningLink} = req.body;
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
    try {
        const today = new Date();
        const events = await EventModel.find({ endDate: { $gt: today } });
        res.status(200).json({
            message: "Upcoming Events Retrieved Successfully",
            events: events
        });
    } catch (err) {
        throwError(res, 400, err.message);
    }
};
