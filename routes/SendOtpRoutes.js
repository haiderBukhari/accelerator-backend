import express from 'express'
import { SendOtp, verifyOtp } from '../controller/OtpController.js';

const OtpRoutes = express.Router();

OtpRoutes.route('/').post(SendOtp).get(verifyOtp);

export default OtpRoutes;