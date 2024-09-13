import { Client, Environment } from 'square';
import { v4 as uuidv4 } from 'uuid'
import { config } from 'dotenv';
import axios from 'axios';
import crypto from 'crypto'
import { AuthenticationModel } from '../models/AuthenticationModel.js';
config()

const squareClient = new Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN, // Your Sandbox Access Token
    environment: Environment.Sandbox, // Use Sandbox for test mode
});

const locationId = process.env.SQUARE_LOCATION_ID; // Your Sandbox Location ID
export const createCheckout = async (req, res) => {
    const idempotencyKey = uuidv4(); // Generate a unique UUID for the idempotency key
    const { plan, id } = req.body; // Amount from the request

    try {
        const response = await squareClient.checkoutApi.createPaymentLink({
            idempotencyKey: idempotencyKey,
            order: {
                locationId: locationId,
                lineItems: [
                    {
                        name: 'Accelerator Plan', // Change this to your product name
                        quantity: '1', // Set quantity
                        basePriceMoney: {
                            amount:(plan.toLowerCase() === 'monthly' ? 147 :1497) * 100,
                            currency: 'USD',
                        },
                    },
                ],
            },
            redirectUrl: 'https://e82fbae1e5017b1fdc0171051a818ab0.serveo.net/api/payment/webhook',
        });
        const checkoutLink = response.result.paymentLink.url; 
        const orderId = response.result.paymentLink.orderId;
        const data = await AuthenticationModel.findById(id)
        data.orderId = orderId;
        data.initialType = plan.toLowerCase();
        await data.save(); 
        res.json({ checkoutLink });
    } catch (error) {
        console.error('Error creating checkout link:', error);
        res.status(500).json({ error: error.message });
    }
};

export const webhook = async (req, res) => {
    const event = req.body;
    if (event.type === 'payment.updated') {
        const paymentId = event.data.object.payment.id;
        console.log(event.data.object.payment.order_id)
        const data = await AuthenticationModel.findOne({orderId: event.data.object.payment.order_id})
        if (!data) {
            console.log('Payment not found');
            return;
        }
        if(data.initialType == 'monthly'){
            const currentDate = new Date();
            const expirationDate = new Date(currentDate);
            expirationDate.setMonth(currentDate.getMonth() + 1);
            data.isMonthlySubscriber = true;
            data.dateOfSubscription = currentDate;
            data.dateOfUnsubscription = expirationDate;
        }else{
            const currentDate = new Date();
            const expirationDate = new Date(currentDate);
            expirationDate.setFullYear(currentDate.getFullYear() + 1);
            data.isYearlySubscriber = true;
            data.dateOfSubscription = currentDate;
            data.dateOfUnsubscription = expirationDate;
        }
        await data.save();
    }
    res.status(200).send('Webhook received');
}