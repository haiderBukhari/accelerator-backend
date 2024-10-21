import mongoose from "mongoose";
import { friendModel } from "../models/friendModel.js";
import { PostsModel } from "../models/Posts.js";
import { bucket } from "../routes/PostsRoutes.js";
import { throwError } from "../utils/error.js";
import { AuthenticationModel } from "../models/AuthenticationModel.js";

export const uploadPost = async (req, res) => {
    const { isImage, isVideo, text, groupPost, groupId } = req.body;
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
                owner: req.id,
                isGroupPost: groupPost == true,
                group: groupPost == true ? groupId: null 
            })

            const userData = await AuthenticationModel.findById(req.id);
            userData.activity += 5;
            await userData.save(); 

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
        const currentPage = parseInt(req.query.currentPage) || 1;
        const pageSize = 10;
        const skip = (currentPage - 1) * pageSize;
        const id = req.id; // User ID from the request
        const { groupId, isOnlySavedPost } = req.query; // Extract query parameters

        // If groupId is provided, fetch posts related to that group only
        if (groupId) {
            const groupPosts = await PostsModel.aggregate([
                {
                    $match: {
                        group: new mongoose.Types.ObjectId(groupId), // Filter posts for the given group
                        ...(isOnlySavedPost === 'true' && { savedBy: new mongoose.Types.ObjectId(id) }) // If isOnlySavedPost is true, only include saved posts
                    }
                },
                { $sort: { createdAt: -1 } }, // Sort by createdAt in descending order
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
                        likeBy: 1,
                        comments: 1,
                        shares: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        owner: 1,
                        'userInfo.firstName': 1,
                        'userInfo.lastName': 1,
                        'userInfo.profilePicture': 1,
                        'userInfo._id': 1
                    }
                }
            ]);

            return res.status(200).json(groupPosts);
        }

        // If groupId is not provided, fetch posts from all users
        const posts = await PostsModel.aggregate([
            {
                $match: {
                    ...(isOnlySavedPost === 'true' && { savedBy: new mongoose.Types.ObjectId(id) }) // If isOnlySavedPost is true, only include saved posts
                }
            },
            { $sort: { createdAt: -1 } }, // Sort by createdAt in descending order
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
                    likeBy: 1,
                    savedBy: 1,
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


export const likePost = async (req, res) => {
    try {
        const postId = req.body.id; // Assuming post ID is passed as a route param
        const userId = req.id; // Assuming the user ID is obtained from the token/session

        // Check if the post exists
        const post = await PostsModel.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Check if the user has already liked the post
        const alreadyLiked = post.likeBy.includes(userId);

        if (alreadyLiked) {
            // User has already liked, so unlike the post
            post.likes -= 1;
            post.likeBy = post.likeBy.filter(id => id.toString() !== userId.toString());
        } else {
            // User hasn't liked, so like the post
            post.likes += 1;
            post.likeBy.push(userId);
        }

        // Save the post with the updated likes
        await post.save();

        res.status(200).json({
            message: alreadyLiked ? "Post unliked successfully." : "Post liked successfully.",
            post,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const savePost = async (req, res) => {
    try {
        const postId = req.body.id; // Assuming post ID is passed as a route param
        const userId = req.id; // Assuming the user ID is obtained from the token/session

        // Check if the post exists
        const post = await PostsModel.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Check if the user has already liked the post
        const alreadyLiked = post.savedBy.includes(userId);

        if (alreadyLiked) {
            // User has already liked, so unlike the post
            post.savedBy = post.savedBy.filter(id => id.toString() !== userId.toString());
        } else {
            // User hasn't liked, so like the post
            post.savedBy.push(userId);
        }

        // Save the post with the updated likes
        await post.save();

        res.status(200).json({
            message: alreadyLiked ? "Post saved successfully." : "Post marked as unsaved.",
            post,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
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
        const { text, groupPost, groupId } = req.body;
        if (!text) throw new Error("Post can't be empty")
        const posts = await PostsModel.create({ owner: id, text: text, isGroupPost: groupPost == true, group: groupPost == true ? groupId: null  });
        const userData = await AuthenticationModel.findById(req.id);
        userData.activity += 5;
        await userData.save(); 
        res.status(200).json({
            message: 'uploaded successfully.',
            newPost: posts,
        });
    } catch (err) {
        throwError(res, 400, err.message);
    }
} 