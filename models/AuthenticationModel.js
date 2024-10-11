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
    backgroundPicture: {
        type: String,
        default: ''
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isManager: {
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
    },
    isMonthlySubscriber: {
        type: Boolean,
        default: false
    },
    isYearlySubscriber: {
        type: Boolean,
        default: false
    },
    dateOfSubscription: {
        type: Date,
        default: null
    },
    dateOfUnsubscription: {
        type: Date,
        default: null
    },
    orderId: {
        type:String,
        default: ''
    },
    initialType: {
        type:String,
        default: ''
    },
    courseCompleted: {
        type: Number,
        default: 0
    },
    score: {
        type: Number,
        default: 0
    },
    activity: {
        type: Number,
        default: 0
    }
})

export const AuthenticationModel = mongoose.model('Authentication', AuthenticationSchema)