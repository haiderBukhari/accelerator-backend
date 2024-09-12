import express from 'express'
import { createCheckout, verifySquareSignature, webhook } from '../controller/PaymentController.js';

const PaymentRoutes = express.Router();

PaymentRoutes.route('/').post(createCheckout);
PaymentRoutes.route('/webhook').post(verifySquareSignature, webhook);

export default PaymentRoutes;