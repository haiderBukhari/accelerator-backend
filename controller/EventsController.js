import { EventModel } from "../models/eventsModel.js";
import { throwError } from "../utils/error.js";
import { bucket } from "../routes/eventsRoutes.js";
import { AuthenticationModel } from "../models/AuthenticationModel.js";

export const createEvent = async (req, res) => {
    try {
        const { name, description, startDate, endDate, eventType, address, joiningLink } = req.body;
        if (!req.file) {
            res.status(400).send('No file uploaded.');
            return;
        }

        if (!name || !description || !startDate || !endDate || !eventType) {
            throw new Error("Alll Fields are Required");
        }

        const file = req.file;
        const fileName = `${Date.now()}_${file.originalname}`;
        const fileUpload = bucket.file(fileName);

        const stream = fileUpload.createWriteStream({
            metadata: {
                contentType: file.mimetype,
            },
        });

        stream.on('error', err => {
            console.error('Error uploading to GCS:', err);
            res.status(500).send('Error uploading file.');
        });

        stream.on('finish', async () => {
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
            const data = await EventModel.create({
                name,
                description,
                startDate,
                endDate,
                eventType,
                address,
                joiningLink,
                backgroundImage: publicUrl
            })
            res.status(200).json({
                message: "Event Created Successfully",
                events: data
            })
        });

        stream.end(file.buffer); // Write file buffer to stream
    } catch (err) {
        throwError(res, 400, err.message);
    }
}

export const getUpcomingEvents = async (req, res) => { 
    try {
        const today = new Date();
        
        // Fetch upcoming events
        const events = await EventModel.find({ endDate: { $gt: today } });
        
        const updatedEvents = await Promise.all(
            events.map(async (event) => {
                const attendees = await AuthenticationModel.find({
                    _id: { $in: event.attendingPeoples }
                }, "firstName lastName profilePicture"); // Select specific fields

                return {
                    id: event._id,
                    name: event.name,
                    backgroundImage: event.backgroundImage,
                    description: event.description,
                    startDate: event.startDate,
                    endDate: event.endDate,
                    eventType: event.eventType,
                    joiningLink: event.joiningLink,
                    address: event.address,
                    likes: event.likes,
                    peopleAttending: event.peopleAttending,
                    attending: event.attendingPeoples.includes(req.id),
                    attendees // List of attendee objects with name, ID, and profile picture
                };
            })
        );

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
        if (events.attendingPeoples.includes(attendeeId)) throw new Error("Already Attending");
        events.attendingPeoples.push(attendeeId);
        await events.save();
        res.status(200).json({
            events: {...events, attending: true},
        });
    } catch (err) {
        throwError(res, 400, err.message);
    }
}

// delete the event
export const deleteEvent = async (req, res) => {
    try {
        const eventId = req.query.id;
        const events = await EventModel.findByIdAndDelete(eventId);
        if (!events) throw new Error("Event not found");
        res.status(200).json({
            message: "Event deleted successfully",
            events: events
        });
    } catch (err) {
        throwError(res, 400, err.message);
    }
}