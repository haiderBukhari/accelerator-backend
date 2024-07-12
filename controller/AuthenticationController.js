import { AuthenticationModel } from "../models/AuthenticationModel.js";
import crypto from 'crypto'
import { throwError } from "../utils/error.js";
import jwt from "jsonwebtoken";

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
    const isProduction = process.env.NODE_ENV === 'production';
    const { email, password } = req.query;
    try {
        const user = await AuthenticationModel.findOne({ email: email });
        if (!user) throw new Error("User not found.");
        const isMatch = await verify(password, user.password);
        if (!isMatch) throw new Error("Invalid credentials.");
        const token = jwt.sign({ id: user._id }, process.env.COOKIE_SECRET, { expiresIn: '10d' });
        res.cookie("token", token, { maxAge: 60000 * 60 * 24 * 10, secure: isProduction, SameSite: 'none' });
        res.status(200).json({ message: "User logged in successfully.", id: user._id, recoveryEmail: user.recoveryEmail });
    } catch (err) {
        throwError(res, 400, err.message);
    }
}

export const addRecoveryEmail = async (req, res) => {
    const isProduction = process.env.NODE_ENV === 'production';
    try {
        const authId = req.body.id;
        const user = await AuthenticationModel.findByIdAndUpdate(authId, { recoveryEmail: req.body.recoveryEmail }, { new: true });
        const token = jwt.sign({ id: user._id }, process.env.COOKIE_SECRET, { expiresIn: '10d' });
        res.cookie("token", token, { maxAge: 60000 * 60 * 24 * 10, secure: isProduction });
        if (!user) throw new Error("User not found.");
        res.status(200).json({ message: "Recovery email added successfully." });
    } catch (err) {
        throwError(res, 400, err.message);
    }
}

export const changePassword = async (req, res) => {
    const isProduction = process.env.NODE_ENV === 'production';
    try {
        const authId = req.body.id;
        const hashedPassword = await hash(req.body.password);
        const user = await AuthenticationModel.findByIdAndUpdate(authId, { password: hashedPassword }, { new: true });
        const token = jwt.sign({ id: user._id }, process.env.COOKIE_SECRET, { expiresIn: '10d' });
        res.cookie("token", token, { maxAge: 60000 * 60 * 24 * 10, secure: isProduction });
        if (!user) throw new Error("User not found.");
        res.status(200).json({ message: "Password Change Successfully." });
    } catch (err) {
        throwError(res, 400, err.message);
    }
}

// (async function run () {
//     const password1 = await hash("123456")
//     const password2 = await hash("123456")
//     console.log("password1", await verify("123456", password1));
//     console.log("password2", await verify("123456", password2));
//     console.log("password1 == password2", password1 == password2);
// })()