import { Note } from "../models/NotesModel.js";

export const getAllNotes = async (req, res) => {
    try {
        const notes = await Note.find().sort({ timestamp: -1 }); // Sort by timestamp in descending order
        res.status(200).json(notes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notes', error });
    }
};

// Function to add a new note
export const addNote = async (req, res) => {
    const { title, notes } = req.body;

    if (!title || !notes) {
        return res.status(400).json({ message: 'Title and notes are required.' });
    }

    try {
        const newNote = new Note({
            title,
            notes,
        });
        await newNote.save();

        const notes1 = await Note.find().sort({ timestamp: -1 }); // Sort by timestamp in descending order
        res.status(201).json(notes1);
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: 'Error saving note', error });
    }
};