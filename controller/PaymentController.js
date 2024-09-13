import { Client, Environment } from 'square';
import { v4 as uuidv4 } from 'uuid'
import { config } from 'dotenv';
import axios from 'axios';
import crypto from 'crypto'
config()

const squareClient = new Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN, // Your Sandbox Access Token
    environment: Environment.Sandbox, // Use Sandbox for test mode
});

const locationId = process.env.SQUARE_LOCATION_ID; // Your Sandbox Location ID
// export const createCheckout = async (req, res) => {
//     const idempotencyKey = uuidv4(); // Generate a unique UUID for the idempotency key

//     try {
//         const response = await squareClient.checkoutApi.createCheckout(
//             locationId, // Location ID as a string
//             {
//                 idempotencyKey: idempotencyKey,
//                 order: {
//                     location_id: locationId, // Replace with your location ID
//                     line_items: [
//                         {
//                             name: '60,000 mile maintenance',
//                             quantity: '1',
//                             base_price_money: {
//                                 amount: 30000,
//                                 currency: 'USD'
//                             },
//                             note: '1st line item note'
//                         },
//                         // ... other line items
//                     ]
//                 },
//                 redirectUrl: 'https://yourdomain.com/checkout/complete', // Replace with your redirect URL
//                 metadata: {
//                     custom_id: 'CUSTOM_IDENTIFIER' // Replace with your custom metadata
//                 }
//             }
//         );

//         console.log('Checkout Session Created:', response.result);
//         return res.json({ checkoutId: response.result.checkout.id, checkoutUrl: response.result.checkout.checkout_page_url });
//     } catch (error) {
//         console.log(error)
//         console.error('Error creating checkout session:', error.response ? error.response.data : error.message);
//         return res.status(500).json({ error: error.message });
//     }
// };

// export const createCheckout = async (req, res) => {
//     try {
//         const { amount, userId } = req.body; // Pass the amount and userId
//         const amountInCents = parseInt(amount) * 100; // Convert dollars to cents

//         const paymentResponse = await squareClient.paymentsApi.createPayment({
//             sourceId: 'nonce', // Replace with a valid payment source
//             idempotencyKey: new Date().getTime().toString(),
//             amountMoney: {
//                 amount: amountInCents, // Amount in smallest currency unit (e.g., cents)
//                 currency: 'USD', // Set currency to USD
//             },
//             locationId: locationId,
//             metadata: {
//                 userId: userId.toString(), // Ensure userId is a string
//             },
//         });

//         res.json({ paymentId: paymentResponse.result.payment.id });
//     } catch (error) {
//         console.error('Error creating payment:', error);
//         res.status(500).json({ error: error.message });
//     }
// }
export const createCheckout = async (req, res) => {
    const idempotencyKey = uuidv4(); // Generate a unique UUID for the idempotency key
    const { amount } = req.body; // Amount from the request

    try {
        // Create a new checkout link for production
        const response = await squareClient.checkoutApi.createPaymentLink({
            idempotencyKey: idempotencyKey,
            order: {
                locationId: locationId,
                lineItems: [
                    {
                        name: 'Product Name', // Change this to your product name
                        quantity: '1', // Set quantity
                        basePriceMoney: {
                            amount: amount * 100, // Amount in cents (multiply by 100 for USD)
                            currency: 'USD',
                        },
                    },
                ],
            },
            redirectUrl: 'https://e82fbae1e5017b1fdc0171051a818ab0.serveo.net/api/payment/webhook', // Production URL after successful payment
        });
        const checkoutLink = response.result.paymentLink.url; 
        const orderId = response.result.paymentLink.orderId; 
        console.log(orderId)

        // Send the checkout link to the frontend
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
        // const userId = order.metadata.userId; // Retrieve the userId from order metadata

        // Log the payment ID and user ID
        // console.log(`Payment ID: ${paymentId}`);
        // console.log(`User ID: ${userId}`);

        // You can further process the payment here (e.g., check status, amount, etc.)
    }

    res.status(200).send('Webhook received');
}