// paypal.js
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const CLIENT_SECRET = process.env.PAYPAL_APP_SECRET;
const PAYPAL_API_URL = 'https://api.sandbox.paypal.com';

export const getPayPalAccessToken = async () => {
  try {
    const credentials = `${CLIENT_ID}:${CLIENT_SECRET}`;
    const base64Credentials = Buffer.from(credentials).toString('base64');

    const { data } = await axios.post(
      `${PAYPAL_API_URL}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${base64Credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return data.access_token;
  } catch (error) {
    throw error;
  }
};

export const verifyPayPalPayment = async (paymentId) => {
  try {
    const accessToken = await getPayPalAccessToken();

    const { data } = await axios.get(
      `${PAYPAL_API_URL}/v2/checkout/orders/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const { status, purchase_units } = data;

    return {
      verified: status === 'COMPLETED',
      purchaseUnits: purchase_units,
    };
  } catch (error) {
    throw error;
  }
};
