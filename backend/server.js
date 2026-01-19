const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const axios = require("axios");
require("dotenv").config(); // Loads variables from .env file into process.env

const app = express();
app.use(cors()); 
app.use(express.json()); 

// Initialize Firebase Admin
// Service account key
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error("Invalid FIREBASE_SERVICE_ACCOUNT JSON in .env");
    admin.initializeApp(); // Fallback 
  }
} else {
  // 
  admin.initializeApp();
}

const db = admin.firestore();
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// For payment verification endpoint
app.post("/verify-payment", async (req, res) => {
  const { reference, email, amount, id } = req.body;

  if (!reference || !email || !amount) {
    return res.status(400).json({ error: "Missing required data" });
  }

  try {
    // For transaction reference validation
    const verifyRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      },
    );

    const data = verifyRes.data?.data;

    // For transaction status validation
    if (!data || data.status !== "success") {
      console.error("Paystack verification failed:", data?.gateway_response);
      return res.status(400).json({
        error: `Payment failed: ${data?.gateway_response || "Invalid status"}`,
      });
    }

    // For amount validation
    if (Number(data.amount) !== Number(amount)) {
      return res.status(400).json({ error: "Amount mismatch detected" });
    }

    // For database update with request ID
    if (id) {
      await db.collection("pickupRequests").doc(id).update({
        status: "paid",
        paymentStatus: "paid",
        paymentReference: reference,
        paidAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`Payment confirmed for request: ${id}`);
    }

    return res.json({ success: true, status: "verified" });
  } catch (error) {
    console.error("Verification Error:", error.response?.data || error.message);
    return res
      .status(500)
      .json({ error: "Internal server error during verification" });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Backend running on http://localhost:${PORT}`),
);
