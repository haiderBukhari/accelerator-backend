import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        default: ''
    },
    endDate: {
        type: Date,
        default: ''
    },
    eventType: {
        type: String,
        required: true
    },
    joiningLink: {
        type: String,
    },
    address: {
        type: String,
    }
}, {timestamps: true})

export const EventModel = mongoose.model('events', EventSchema)