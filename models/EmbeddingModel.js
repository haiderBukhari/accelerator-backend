import mongoose from "mongoose";

const embeddedHtmlSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    descriptionHtml: {
        type: String, // Store the raw HTML string
        required: true,
    },
    routeName: {
        type: String,
        required: true,
        unique: true,
    },
    isPrivate: {
        type: Boolean,
        default: true,
    }
}, {timestamps: true});

embeddedHtmlSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

export const EmbeddedHtmlModel = mongoose.model("EmbeddedHtml", embeddedHtmlSchema);