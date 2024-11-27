import mongoose from "mongoose";
import { EmbeddedHtmlModel } from "../models/EmbeddingModel.js";

export const createEmbeddedHtml = async (req, res) => {
    try {
        const { title, descriptionHtml, routeName } = req.body;

        // Validate input
        if (!title || !descriptionHtml) {
            return res.status(400).json({ message: "Title and descriptionHtml are required." });
        }

        // Save to database
        const newContent = new EmbeddedHtmlModel({ title, descriptionHtml, routeName });
        await newContent.save();

        res.status(201).json({ message: "Content created successfully.", content: newContent });
    } catch (error) {
        res.status(500).json({ message: "Error creating content.", error: error.message });
    }
};

export const getAllEmbeddedHtml = async (req, res) => {
    try {
        const contents = await EmbeddedHtmlModel.find();
        res.status(200).json(contents);
    } catch (error) {
        res.status(500).json({ message: "Error fetching content.", error: error.message });
    }
};

export const getEmbeddedHtmlById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid ID." });
        }

        const content = await EmbeddedHtmlModel.findById(id);
        if (!content) {
            return res.status(404).json({ message: "Content not found." });
        }

        res.status(200).json(content);
    } catch (error) {
        res.status(500).json({ message: "Error fetching content.", error: error.message });
    }
};

export const getEmbeddedHtmlByRouteName = async (req, res) => {
    try {
        const { routeName } = req.params;

        const content = await EmbeddedHtmlModel.findOne({routeName: routeName});
        if (!content) {
            return res.status(404).json({ message: "Content not found." });
        }

        res.status(200).json(content);
    } catch (error) {
        res.status(500).json({ message: "Error fetching content.", error: error.message });
    }
};

export const updateEmbeddedHtml = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, descriptionHtml, routeName } = req.body;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid ID." });
        }

        const updatedContent = await EmbeddedHtmlModel.findByIdAndUpdate(
            id,
            { title, descriptionHtml, routeName, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        if (!updatedContent) {
            return res.status(404).json({ message: "Content not found." });
        }

        res.status(200).json({ message: "Content updated successfully.", content: updatedContent });
    } catch (error) {
        res.status(500).json({ message: "Error updating content.", error: error.message });
    }
};

export const deleteEmbeddedHtml = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid ID." });
        }

        const deletedContent = await EmbeddedHtmlModel.findByIdAndDelete(id);
        if (!deletedContent) {
            return res.status(404).json({ message: "Content not found." });
        }

        res.status(200).json({ message: "Content deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Error deleting content.", error: error.message });
    }
};

export const togglePrivate = async (req, res) => {
    const { routeName } = req.params; // Route parameter for the 'routeName'

    try {
        const htmlContent = await EmbeddedHtmlModel.findById(routeName);

        if (!htmlContent) {
            return res.status(404).json({ error: 'HTML content not found' });
        }

        if(htmlContent.isPrivate){
            htmlContent.isPrivate = false
        }else{
            htmlContent.isPrivate = true;
        }

        await htmlContent.save();

        // Respond with the updated document
        return res.status(200).json({
            message: `HTML content privacy toggled successfully to ${htmlContent.isPrivate}`,
            data: htmlContent,
        });
    } catch (error) {
        console.error('Error toggling privacy:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
