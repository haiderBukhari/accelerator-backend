import { PostsModel } from "../models/Posts.js";
import { bucket } from "../routes/PostsRoutes.js";

export const uploadPost = async (req, res) => {
    const {isImage, isVideo, text} = req.body;  
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
                imageUrl: isImage ? publicUrl : '',
                videoUrl: isVideo ? publicUrl : ''
           })
            res.status(200).json({
                message: 'File uploaded successfully.',
                newPost: newPost,
            });
        });

        stream.end(file.buffer); // Write file buffer to stream

    } catch (err) {
        console.error('Error uploading file:', err);
        res.status(500).send('Error uploading file.');
    }
}