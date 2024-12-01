import { Client, Environment } from 'square';
import { v4 as uuidv4 } from 'uuid';
import { config } from 'dotenv';
import axios from 'axios';
import { AuthenticationModel } from '../models/AuthenticationModel.js';

config();

const squareClient = new Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN, // Your Sandbox Access Token
    environment: Environment.Sandbox, // Use Sandbox for test mode
});

const locationId = process.env.SQUARE_LOCATION_ID; // Your Sandbox Location ID

export const createCheckout = async (req, res) => {
    const idempotencyKey = uuidv4(); // Generate a unique UUID for the idempotency key
    const { plan, id } = req.body; // Plan ('monthly' or 'yearly') from the request

    try {
        // Determine the pricing based on the plan
        const priceAmount = plan.toLowerCase() === 'monthly' ? 147 : 1497; // Monthly or Yearly amount in USD

        // Create a subscription plan
        const response = await squareClient.subscriptionsApi.createSubscription({
            idempotencyKey: idempotencyKey,
            subscription: {
                locationId: locationId,
                planId: process.env.SQUARE_PLAN_ID, // Plan ID from your Square dashboard
                customerId: id, // Assuming `id` is the Square Customer ID, otherwise create a new customer
                startDate: new Date().toISOString(),
                chargeAmountMoney: {
                    amount: priceAmount * 100, // Amount in cents (USD)
                    currency: 'USD',
                },
                subscriptionAmountMoney: {
                    amount: priceAmount * 100, // Set amount for recurring billing
                    currency: 'USD',
                },
                billingCycle: 'MONTHLY', // Set to 'MONTHLY' for recurring payments
                cancellationPolicy: {
                    cancelAtEndOfPeriod: true, // Automatically cancel at the end of the period
                },
            },
        });

        const subscriptionId = response.result.subscription.id;
        const data = await AuthenticationModel.findById(id);

        // Save the subscription ID and plan type
        data.subscriptionId = subscriptionId;
        data.initialType = plan.toLowerCase();
        data.isSubscribed = true;
        await data.save();

        res.json({ message: 'Subscription created successfully', subscriptionId });
    } catch (error) {
        console.error('Error creating subscription:', error);
        res.status(500).json({ error: error.message });
    }
};

// Webhook to handle subscription updates
export const webhook = async (req, res) => {
    const event = req.body;

    if (event.type === 'subscription.updated') {
        const subscriptionId = event.data.object.subscription.id;

        const data = await AuthenticationModel.findOne({ subscriptionId: subscriptionId });
        if (!data) {
            console.log('Subscription not found');
            return;
        }

        if (data.initialType === 'monthly') {
            const currentDate = new Date();
            const expirationDate = new Date(currentDate);
            expirationDate.setMonth(currentDate.getMonth() + 1); // Monthly expiration date

            data.isMonthlySubscriber = true;
            data.dateOfSubscription = currentDate;
            data.dateOfUnsubscription = expirationDate;
        } else {
            const currentDate = new Date();
            const expirationDate = new Date(currentDate);
            expirationDate.setFullYear(currentDate.getFullYear() + 1); // Yearly expiration date

            data.isYearlySubscriber = true;
            data.dateOfSubscription = currentDate;
            data.dateOfUnsubscription = expirationDate;
        }

        await data.save();
    }

    res.status(200).send('Webhook received');
};
