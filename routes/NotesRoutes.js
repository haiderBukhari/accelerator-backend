import express from 'express'
import { addNote, getAllNotes } from '../controller/NotesController.js';

const NotesRouter = express.Router();

NotesRouter.get('/', getAllNotes);
NotesRouter.post('/', addNote);

export default NotesRouter