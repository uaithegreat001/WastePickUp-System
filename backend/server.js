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

// If you have the JSON content in an ENV variable (Best for Render):
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
const BREVO_API_KEY = process.env.BREVO_API_KEY;

// Helper to send Email
async function sendEmail(to, subject, htmlContent) {
  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "WastePickUp System",
          email: "no-reply@wastepickup.com",
        },
        to: [{ email: to }],
        subject: subject,
        htmlContent: htmlContent,
      },
      {
        headers: {
          "api-key": BREVO_API_KEY,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("Email failed:", error.message);
  }
}

// =====================================================
// 1. VERIFY PAYMENT & UPDATE DB
// =====================================================
app.post("/verify-payment", async (req, res) => {
  const { reference, email, amount, type, id } = req.body;
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
      return res
        .status(400)
        .json({
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
      return res
        .status(400)
        .json({
          error: `Amount mismatch: Paid ${data.amount}, Expected ${amount}`,
        });
    }

    // C. Update Firebase (only if ID + type provided)
    if (id && type) {
      const collectionName = type === "order" ? "binOrders" : "pickupRequests";

      await db.collection(collectionName).doc(id).update({
        status: "paid",
        paymentStatus: "paid",
        paymentReference: reference,
        paidAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`Updated ${collectionName}/${id} as paid`);
    }

    // D. Send Receipt Email (AFTER verification)
    await sendEmail(
      email,
      "Payment Receipt - WastePickUp",
      `<h1>Payment Successful</h1>
       <p>We received <b>₦${(amount / 100).toLocaleString()}</b>.</p>
       <p>Reference: ${reference}</p>`
    );

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

// =====================================================
// 2. ADMIN SCHEDULE PICKUP
// =====================================================
app.post("/schedule-pickup", async (req, res) => {
  const { id, type, date, driverName, userEmail } = req.body;

  try {
    // A. Update DB
    const collectionName = type === "order" ? "binOrders" : "pickupRequests";
    await db.collection(collectionName).doc(id).update({
      status: "scheduled",
      scheduledDate: date,
      driverName: driverName,
      scheduledAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // B. Send Email
    try {
      await sendEmail(
        userEmail,
        "Pickup Scheduled!",
        `<h1>Your Pickup has been Scheduled!</h1>
         <p>Hello,</p>
         <p>Your waste pickup has been scheduled by our admin.</p>
         <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
           <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
           <p><strong>Time:</strong> ${new Date(date).toLocaleTimeString([], {
             hour: "2-digit",
             minute: "2-digit",
           })}</p>
           <p><strong>Driver Name:</strong> ${driverName}</p>
         </div>
         <p>Please be available and ensure your bin is accessible.</p>`
      );
    } catch (emailError) {
      console.error("Failed to send schedule email:", emailError);
      // Optionally, you could return an error here if email is critical
      // return res.status(500).json({ error: "Schedule updated but email failed" });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// 3. ADMIN REPLY MESSAGE
// =====================================================
app.post("/admin/reply-message", async (req, res) => {
  const { id, reply, userEmail } = req.body;

  try {
    // A. Update DB
    await db.collection("supportTickets").doc(id).update({
      status: "resolved",
      adminResponse: reply,
      respondedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // B. Send Email
    await sendEmail(
      userEmail,
      "New Reply from Support",
      `<h1>Support Reply</h1>
       <p>${reply}</p>`
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
