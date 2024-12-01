import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    backgroundImage: {
        type: String,
        default: ''
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
    time: {
        type: String,
        default: '',
    },
    eventType: {
        type: String,
        required: true
    },
    joiningLink: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },
    likes: {
        type:Number,
        default: 0
    },
    peopleAttending: {
        type:Number,
        default: 0
    },
    attendingPeoples: [
        {
            type: mongoose.Schema.Types.ObjectId,
        }
    ]
}, {timestamps: true})

export const EventModel = mongoose.model('events', EventSchema)