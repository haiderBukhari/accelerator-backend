import mongoose from "mongoose";

// models/noteModel.js
const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    notes: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now, // Automatically set timestamp to current date
    },
});

// Create and export the model
export const Note = mongoose.model('Note', noteSchema);