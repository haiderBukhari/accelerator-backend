import mongoose from "mongoose";

const OtpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        default: ''
    }
})

export const OtpModel = mongoose.model('Otp', OtpSchema)