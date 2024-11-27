import { AuthenticationModel } from "../models/AuthenticationModel.js";
import crypto from 'crypto'
import { throwError } from "../utils/error.js";
import jwt from "jsonwebtoken";
import { bucket } from "../routes/AuthenticationRoutes.js";
import mongoose from "mongoose";

async function hash(password) {
    return new Promise((resolve, reject) => {
        const salt = crypto.randomBytes(8).toString("hex")

        crypto.scrypt(password, salt, 64, (err, derivedKey) => {
            if (err) reject(err);
            resolve(salt + ":" + derivedKey.toString('hex'))
        });
    })
}

async function verify(password, hash) {
    return new Promise((resolve, reject) => {
        const [salt, key] = hash.split(":")
        crypto.scrypt(password, salt, 64, (err, derivedKey) => {
            if (err) reject(err);
            resolve(key == derivedKey.toString('hex'))
        });
    })
}

export const registerUser = async (req, res) => {
    const { firstName, lastName, email, phoneNumber, password } = req.body;
    try {
        const hashPassword = await hash(password);
        const user = new AuthenticationModel({ firstName, lastName, email, phoneNumber, password: hashPassword });
        await user.save();
        res.status(201).json({ message: "User registered successfully.", id: user._id });
    } catch (err) {
        throwError(res, 400, "Please use a different email or sign in to your existing account");
    }
}

export const loginUser = async (req, res) => {
    const { email, password } = req.query;
    try {
        const user = await AuthenticationModel.findOne({ email: email });
        if (!user) throw new Error("User not found.");
        const isMatch = await verify(password, user.password);
        if (!isMatch) throw new Error("Invalid credentials.");
        let isSubscriber = false;
        const currentDate = new Date();
        if ((user.isMonthlySubscriber || user.isYearlySubscriber) && user.dateOfUnsubscription) {
            if (user.dateOfUnsubscription > currentDate) {
                isSubscriber = true;
            }
        }
        const token = jwt.sign({ id: user._id }, process.env.COOKIE_SECRET);
        res.status(200).json({ message: "User logged in successfully.", id: user._id, recoveryEmail: user.recoveryEmail, token: token, profilePicture: user.profilePicture, firstName: user.firstName, lastName: user.lastName, isSubscriber: isSubscriber });
    } catch (err) {
        throwError(res, 400, err.message);
    }
}

export const addRecoveryEmail = async (req, res) => {

    try {
        const authId = req.body.id;
        const existingUser = await AuthenticationModel.findOne({ recoveryEmail: req.body.recoveryEmail });
        if (existingUser) throw new Error("Recovery Email already linked to another account.");
        const user = await AuthenticationModel.findByIdAndUpdate(authId, { recoveryEmail: req.body.recoveryEmail, isRecoveryEmailAdded: true }, { new: true });
        let isSubscriber = false;
        const currentDate = new Date();
        if ((user.isMonthlySubscriber || user.isYearlySubscriber) && user.dateOfUnsubscription) {
            if (user.dateOfUnsubscription > currentDate) {
                isSubscriber = true;
            }
        }
        const token = jwt.sign({ id: user._id }, process.env.COOKIE_SECRET);
        if (!user) throw new Error("User not found.");
        res.status(200).json({ message: "Recovery email added successfully.", id: user._id, token: token, profilePicture: user.profilePicture, firstName: user.firstName, lastName: user.lastName, isSubscriber: isSubscriber });
    } catch (err) {
        throwError(res, 400, err.message);
    }
}

export const changePassword = async (req, res) => {

    try {
        const authId = req.body.id;
        const hashedPassword = await hash(req.body.password);
        const user = await AuthenticationModel.findByIdAndUpdate(authId, { password: hashedPassword }, { new: true });
        if (!user) throw new Error("User not found.");
        let isSubscriber = false;
        const currentDate = new Date();
        if ((user.isMonthlySubscriber || user.isYearlySubscriber) && user.dateOfUnsubscription) {
            if (user.dateOfUnsubscription > currentDate) {
                isSubscriber = true;
            }
        }
        const token = jwt.sign({ id: user._id }, process.env.COOKIE_SECRET);
        res.status(200).json({ message: "Password Change Successfully.", id: user._id, token: token, profilePicture: user.profilePicture, firstName: user.firstName, lastName: user.lastName, isSubscriber: isSubscriber });
    } catch (err) {
        throwError(res, 400, err.message);
    }
}

export const getUserData = async (req, res) => {
    try {
        const authId = req.query.id || req.id;
        if (!authId) throw new Error('id is required');
        if (!mongoose.isValidObjectId(authId)) {
            throw new Error("Invalid id format");
        }
        const user = await AuthenticationModel.findById(authId);
        if (!user) throw new Error("User not found.");
        const userDetails = {
            id: user._id,
            profilePicture: user.profilePicture,
            email: user.email,
            phoneNumber: user.phoneNumber,
            backgroundPicture: user.backgroundPicture,
            firstName: user.firstName,
            lastName: user.lastName,
            bio: user.bio,
            aboutMe: user.aboutMe,
            isAdmin: user.isAdmin,
            isManager: user.isManager,
            createdAt: user.createdAt
        }
        res.status(200).json({ user: userDetails });
    } catch (err) {
        throwError(res, 400, err.message);
    }
}

export const updateProfileInformation = (req, res) => {
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
            const data = await AuthenticationModel.findById(req.id);
            data.profilePicture = publicUrl;
            data.firstName = req.body.firstName ?? data.firstName;
            data.lastName = req.body.lastName ?? data.lastName;
            data.bio = req.body.bio ?? data.bio;
            data.aboutMe = req.body.aboutMe ?? data.aboutMe;
            await data.save();
            res.status(200).json({
                message: 'Profile updated successfully.',
                profilePicture: data.profilePicture,
                firstName: data.firstName,
                lastName: data.lastName
            });
        });

        stream.end(file.buffer);
    } catch (err) {
        throwError(res, 400, 'Error uploading file');
    }
}


export const updateProfile = async (req, res) => {
    try {
        const data = await AuthenticationModel.findById(req.id);
        data.firstName = req.body.firstName ?? data.firstName;
        data.lastName = req.body.lastName ?? data.lastName;
        data.bio = req.body.bio ?? data.bio;
        data.aboutMe = req.body.aboutMe ?? data.aboutMe;
        await data.save();
        res.status(200).json({
            message: 'Profile updated successfully.',
            profilePicture: data.profilePicture, firstName: data.firstName, lastName: data.lastName
        });
    } catch (err) {
        throwError(res, 400, 'Error Updating file');
    }
}

export const getUserRanking = async (req, res) => {
    try {
        // Fetch all users from the database
        const users = await AuthenticationModel.find({ isAdmin: false })
            .select('firstName lastName profilePicture courseCompleted score activity _id'); // Select only the desired fields


        // Map the users to include a `totalSum` field which is the sum of courseCompleted, score, and activity
        const rankedUsers = users.map(user => ({
            ...user._doc, // Spread existing user fields
            totalSum: user.courseCompleted + user.score + user.activity // Calculate the total sum
        }));

        // Sort users based on the totalSum, in descending order
        rankedUsers.sort((a, b) => b.totalSum - a.totalSum);

        // Respond with the ranked users
        res.status(200).json({
            message: "Users ranked by total score",
            users: rankedUsers
        });
    } catch (err) {
        res.status(500).json({
            message: "An error occurred while fetching the user rankings",
            error: err.message
        });
    }
};


export const addModerator = async (req, res) => {
    const { firstName, lastName, email, password, recoveryEmail, isAdmin } = req.body;
    try {
        const currentDate = new Date();
        const expirationDate = new Date(currentDate);
        expirationDate.setFullYear(currentDate.getFullYear() + 50);
        await AuthenticationModel.create({
            firstName,
            lastName,
            email,
            password: await hash(password),
            recoveryEmail,
            isAdmin: isAdmin,
            isManager: !isAdmin,
            isYearlySubscriber: true,
            dateOfSubscription: currentDate,
            dateOfUnsubscription: expirationDate
        })
        res.status(200).json({
            message: "Moderator added successfully"
        })
    } catch (err) {
        res.status(500).json({
            message: "An error occurred while updating user role",
            error: err.message
        });
    }
}

export const getModerators = async (req, res) => {
    try {
        const moderators = await AuthenticationModel.find({
            $or: [{ isAdmin: true }, { isManager: true }],
            _id: { $ne: req.id }
        }).select('firstName lastName email recoveryEmail isAdmin _id');
        
        res.status(200).json({
            message: "Moderators fetched successfully",
            moderators: moderators
        })
    } catch (err) {
        res.status(500).json({
            message: "An error occurred while updating user role",
            error: err.message
        });
    }
}

export const removeModerator = async (req, res) => {
    const { id } = req.query;  // The ID of the moderator to be removed
    try {
        const moderator = await AuthenticationModel.findOneAndDelete({
            _id: id
        });

        if (moderator) {
            res.status(200).json({
                message: "Moderator removed successfully"
            });
        } else {
            res.status(404).json({
                message: "Moderator not found or doesn't have the required role"
            });
        }
    } catch (err) {
        res.status(500).json({
            message: "An error occurred while removing the moderator",
            error: err.message
        });
    }
};
