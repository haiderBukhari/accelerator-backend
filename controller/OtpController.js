import { AuthenticationModel } from "../models/AuthenticationModel.js";
import { OtpModel } from "../models/Otp.js";
import { throwError } from "../utils/error.js";
import { SendEmail } from "../utils/sendOtp.js";

function generateRandomString() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const length = 5;
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }
    result = result.split("").join("-")
    return result;
}

export const SendOtp = async (req, res) => {
    const { email } = req.body;
    try {
        const verifyEmail = await AuthenticationModel.findOne({ recoveryEmail: email });
        if (!verifyEmail) throw new Error("Email not exists.");
        
        let sendOtp = await OtpModel.findOne({ email });
        const otp = generateRandomString();
        
        if (sendOtp) {
            sendOtp.otp = otp;
            await sendOtp.save();
        } else {
            const newOtp = new OtpModel({ email, otp });
            await newOtp.save();
        }
        
        await SendEmail(verifyEmail.recoveryEmail, verifyEmail.name, otp);
        res.status(200).json({ message: "Email Sent Successfully", email: verifyEmail.recoveryEmail });
    } catch (err) {
        throwError(res, 400, err.message);
    }
};

export const verifyOtp = async (req, res) => {
    const { email, otp } = req.query;
    try {
        const verifyEmail = await AuthenticationModel.findOne({ recoveryEmail: email });
        if (!verifyEmail) throw new Error("Email not exists.");
        
        let sentOtp = await OtpModel.findOne({ email });
        if(sentOtp.otp !== otp) throw new Error("Otp Invalid");

        res.status(200).json({ message: "Otp verified Successfully", id: verifyEmail._id });
    } catch (err) {
        throwError(res, 400, err.message);
    }
}
