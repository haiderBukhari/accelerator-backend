import { PostsModel } from "../models/Posts.js";
import { bucket } from "../routes/PostsRoutes.js";
import { throwError } from "../utils/error.js";

export const uploadPost = async (req, res) => {
    const { isImage, isVideo, text } = req.body;
    try {
        if (!req.file) {
            res.status(400).send('No file uploaded.');
            return;
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
            const newPost = await PostsModel.create({
                text: text || '',
                imageUrl: isImage === 'true' ? publicUrl : '',
                videoUrl: isVideo === 'true' ? publicUrl : '',
                owner: req.id
            })
            res.status(200).json({
                message: 'File uploaded successfully.',
                newPost: newPost,
            });
        });

        stream.end(file.buffer); // Write file buffer to stream

    } catch (err) {
        throwError(res, 400, 'Error uploading file');
    }
}

export const getPosts = async (req, res) => {
    try {
        const id = req.id;
        const posts = await PostsModel.find({ owner: id }).sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (err) {
        throwError(res, 400, err.message);
    }
}

export const uploadText = async (req, res) => {
    try {
        const id = req.id;
        const { text } = req.body;
        const posts = await PostsModel.create({ owner: id, text: text });
        res.status(200).json({
            message: 'uploaded successfully.',
            newPost: posts,
        });
    } catch (err) {
        throwError(res, 400, err.message);
    }
} 