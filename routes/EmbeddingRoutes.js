import express from "express";
import { createEmbeddedHtml, deleteEmbeddedHtml, getAllEmbeddedHtml, getEmbeddedHtmlById, getEmbeddedHtmlByRouteName, togglePrivate, updateEmbeddedHtml } from "../controller/EmbeddingController.js";

const embeddingRouter = express.Router();

embeddingRouter.post("/", createEmbeddedHtml); // Create new content
embeddingRouter.get("/", getAllEmbeddedHtml); // Get all content
embeddingRouter.get("/routeName/:routeName", getEmbeddedHtmlByRouteName); // Get all content
embeddingRouter.put("/visibility/:routeName", togglePrivate); // Get all content
embeddingRouter.get("/:id", getEmbeddedHtmlById); // Get content by ID
embeddingRouter.put("/:id", updateEmbeddedHtml); // Update content by ID
embeddingRouter.delete("/:id", deleteEmbeddedHtml); // Delete content by ID

export default embeddingRouter;