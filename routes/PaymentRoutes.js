import express from 'express'
import { createCheckout, webhook } from '../controller/PaymentController.js';

const PaymentRoutes = express.Router();

PaymentRoutes.route('/').post(createCheckout);
PaymentRoutes.route('/webhook').post(webhook);

export default PaymentRoutes;