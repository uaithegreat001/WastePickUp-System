const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// =====================================================
// FIREBASE ADMIN SETUP
// =====================================================
// On Render, we can't just use admin.initializeApp() without creds.
// We expect the Service Account JSON to be in an env variable or file.
// For now, let's try to initialize with default if running locally with CLI,
// otherwise we will need the user to set GOOGLE_APPLICATION_CREDENTIALS in Render.

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else {
  // Fallback (might work locally if you ran 'firebase login')
  admin.initializeApp();
}

const db = admin.firestore();

// =====================================================
// KEYS
// =====================================================
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// =====================================================
// 1. VERIFY PAYMENT & UPDATE DB
// =====================================================
app.post("/verify-payment", async (req, res) => {
  const { reference, email, amount, id } = req.body;
  // amount MUST be in kobo from frontend

  if (!reference || !email || !amount) {
    return res.status(400).json({ error: "Missing required data" });
  }

  try {
    // A. Verify with Paystack
    const verifyRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = verifyRes.data?.data;

    if (!data || data.status !== "success") {
      console.error(
        "Paystack verification failed:",
        data?.gateway_response || "Unknown",
        data?.status
      );
      return res.status(400).json({
        error: `Payment failed: ${
          data?.gateway_response || "Status not success"
        }`,
      });
    }

    // B. Amount validation (CRITICAL)
    // Paystack returns amount in kobo. Input `amount` is also in kobo.
    // Ensure strict comparison
    if (Number(data.amount) !== Number(amount)) {
      console.error(
        `Amount mismatch! Paystack: ${data.amount}, Expected: ${amount}`
      );
      return res.status(400).json({
        error: `Amount mismatch: Paid ${data.amount}, Expected ${amount}`,
      });
    }

    // C. Update Firebase (only if ID provided)
    if (id) {
      const collectionName = "pickupRequests";

      await db.collection(collectionName).doc(id).update({
        status: "paid",
        paymentStatus: "paid",
        paymentReference: reference,
        paidAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`Updated ${collectionName}/${id} as paid`);
    }

    // D. Return success

    return res.json({
      success: true,
      status: "verified",
    });
  } catch (error) {
    console.error("Payment Error:", error);
    return res.status(500).json({
      error: "Payment verification failed",
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
