import mongoose from "mongoose";
import { friendModel } from "../models/friendModel.js";
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
        const currentPage = 1;
        const pageSize = 10;
        const skip = (currentPage - 1) * pageSize;
        const id = req.id;

        const friends = await friendModel.find({
            $or: [
                { owner: id },
                { friendId: id }
            ],
            isfriendAccepted: true
        });

        const friendIds = friends.map(friend =>
            friend.owner.equals(id) ? friend.friendId : friend.owner
        );

        const posts = await PostsModel.aggregate([
            {
                $match: {
                    owner: { $in: friendIds }
                }
            },
            { $sample: { size: 100 } }, // Sample a larger set to get random results
            { $skip: skip },
            { $limit: pageSize },
            {
                $lookup: {
                    from: 'authentications', // Assuming your AuthenticationModel collection name is 'authentications'
                    localField: 'owner',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            { $unwind: '$userInfo' }, // Unwind to deconstruct the array from lookup
            {
                $project: {
                    _id: 1,
                    text: 1,
                    imageUrl: 1,
                    videoUrl: 1,
                    likes: 1,
                    comments: 1,
                    shares: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    owner: 1,
                    'userInfo.firstName': 1,
                    'userInfo.lastName': 1,
                    'userInfo.profilePicture': 1
                }
            }
        ]);
        res.status(200).json(posts);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

export const getIndividualPersonPosts = async (req, res) => {
    try{
        const {id} = req.query;
        if(!id) throw new Error('id is required');
        if (!mongoose.isValidObjectId(id)) {
            throw new Error("Invalid id format");
        }
        const posts = await PostsModel.find({ owner: id }).sort({ createdAt: -1 });
        res.status(200).json(posts);
    }catch (err) {
        res.status(400).json({ message: err.message });
    }
}

export const uploadText = async (req, res) => {
    try {
        const id = req.id;
        const { text } = req.body;
        if (!text) throw new Error("Post can't be empty")
        const posts = await PostsModel.create({ owner: id, text: text });
        res.status(200).json({
            message: 'uploaded successfully.',
            newPost: posts,
        });
    } catch (err) {
        throwError(res, 400, err.message);
    }
} 