const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });
const axios = require("axios");

admin.initializeApp();

// =====================================================
// GET KEYS FROM FIREBASE CONFIG (SECURE)
// =====================================================
const PAYSTACK_SECRET_KEY = functions.config().paystack.secret;
const BREVO_API_KEY = functions.config().brevo.key;
// =====================================================

exports.confirmPayment = functions.https.onRequest((req, res) => {
  // 1. Enable CORS so your React app can talk to this
  cors(req, res, async () => {
    
    // Check if method is POST
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    const { reference, email, amount } = req.body;

    if (!reference || !email) {
      return res.status(400).json({ error: "Missing reference or email" });
    }

    try {
      // 2. VERIFY PAYMENT WITH PAYSTACK
      // We check with Paystack server if this reference is actually valid and paid.
      // This part ensures no one can "fake" a payment success.
      const paystackResponse = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          },
        }
      );

      const paymentData = paystackResponse.data.data;

      if (paymentData.status !== "success") {
        return res.status(400).json({ error: "Payment verification failed", details: paymentData.gateway_response });
      }

      console.log("Payment verified successfully for:", email);

      // =====================================================
      // 3. THIS IS THE BREVO CODE
      // =====================================================
      // Now that we know they paid, we send the receipt.
      const emailData = {
        sender: { name: "WastePickUp System", email: "no-reply@wastepickup.com" }, // Change this email if needed
        to: [{ email: email }],
        subject: "Payment Receipt - WastePickUp",
        htmlContent: `
          <h1>Payment Successful</h1>
          <p>Hi there,</p>
          <p>We received your payment of <b>₦${(amount / 100).toLocaleString()}</b>.</p>
          <p>Transaction Reference: ${reference}</p>
          <p>Thank you for using our service!</p>
        `
      };

      await axios.post(
        "https://api.brevo.com/v3/smtp/email",
        emailData,
        {
          headers: {
            "api-key": BREVO_API_KEY, // <--- This authenticates with Brevo
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
        }
      );
      // =====================================================

      console.log("Email sent successfully to:", email);

      return res.status(200).json({ success: true, message: "Payment verified and receipt sent!" });

    } catch (error) {
      console.error("Error in confirmPayment:", error.response ? error.response.data : error.message);
      return res.status(500).json({ 
        error: "Internal Server Error", 
        details: error.response ? error.response.data : error.message 
      });
    }
  });
});
