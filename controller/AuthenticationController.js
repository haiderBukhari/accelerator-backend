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
        throwError(res, 400, err.message);
    }
}

export const loginUser = async (req, res) => {
    const { email, password } = req.query;
    try {
        const user = await AuthenticationModel.findOne({ email: email });
        if (!user) throw new Error("User not found.");
        const isMatch = await verify(password, user.password);
        if (!isMatch) throw new Error("Invalid credentials.");
        const token = jwt.sign({ id: user._id }, process.env.COOKIE_SECRET);
        res.status(200).json({ message: "User logged in successfully.", id: user._id, recoveryEmail: user.recoveryEmail, token: token, profilePicture: user.profilePicture, firstName: user.firstName, lastName: user.lastName });
    } catch (err) {
        throwError(res, 400, err.message);
    }
}

export const addRecoveryEmail = async (req, res) => {

    try {
        const authId = req.body.id;
        const user = await AuthenticationModel.findByIdAndUpdate(authId, { recoveryEmail: req.body.recoveryEmail, isRecoveryEmailAdded: true }, { new: true });
        const token = jwt.sign({ id: user._id }, process.env.COOKIE_SECRET);
        if (!user) throw new Error("User not found.");
        res.status(200).json({ message: "Recovery email added successfully.", id: user._id, token: token, profilePicture: user.profilePicture, firstName: user.firstName, lastName: user.lastName });
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
        const token = jwt.sign({ id: user._id }, process.env.COOKIE_SECRET);
        res.status(200).json({ message: "Password Change Successfully.",  id: user._id, token: token, profilePicture: user.profilePicture, firstName: user.firstName, lastName: user.lastName });
    } catch (err) {
        throwError(res, 400, err.message);
    }
}

export const getUserData = async (req, res) => {
    try {
        const authId = req.query.id || req.id;
        if(!authId) throw new Error('id is required');
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
            isAdmin: user.isAdmin
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