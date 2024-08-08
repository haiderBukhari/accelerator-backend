import mongoose from "mongoose";

const AuthenticationSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    isRecoveryEmailAdded: {
        type: Boolean,
        default: false
    },
    bio: {
        type: String,
        default: ''
    },
    aboutMe: {
        type: String,
        default: ''    
    },
    profilePicture: {
        type: String,
        default: ''
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    recoveryEmail: {
        type: String,
        default: ''
    },
    socketId: {
        type: String,
        defauld: ''
    }
})

export const AuthenticationModel = mongoose.model('Authentication', AuthenticationSchema)