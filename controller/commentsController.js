import { commentsModel } from "../models/comments.js";
import { PostsModel } from "../models/Posts.js";

export const createComment = async (req, res) => {
    try {
        const { postId, owner, name, comment, userImage } = req.body; // Input data from request

        const newComment = {
            postId,
            owner,
            name,
            comment,
            userImage,
            replies: []
        };

        await commentsModel.create(newComment)
        const post = await PostsModel.findById(postId);
        post.comments  = post.comments + 1;
        await post.save();

        return res.status(200).json({
            message: "Comment added successfully"
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

export const createReply = async (req, res) => {
    try {
        const { commentId, owner, name, comment, userImage } = req.body; // Input data from request
        const comment1 = await commentsModel.findByIdAndUpdate(commentId, { $push: { replies: { owner, name, comment, userImage } } }, { new: true });
        if (!comment1) return res.status(404).json({ message: "Comment not found" });
        return res.status(200).json({
            message: "Reply added successfully",
            comment1
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

export const getCommentsByPostId = async (req, res) => {
    const postId = req.query.id;
    try {
        const comments = await commentsModel.find({
            postId
        });
        return res.status(200).json({ comments });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};