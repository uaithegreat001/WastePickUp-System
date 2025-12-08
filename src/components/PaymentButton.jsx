import React, { useState } from 'react';
import { PaystackButton } from 'react-paystack';
import axios from 'axios';

// =====================================================
// TODO: REPLACE THIS WITH YOUR ACTUAL PUBLIC KEY!
// =====================================================
const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY; // Example: pk_test_...
// =====================================================

// TODO: Update this URL after deploying functions (e.g. https://us-central1-YOUR-PROJECT.cloudfunctions.net/confirmPayment)
// For local testing with emulators, it might look like http://localhost:5001/...
const CONFIRM_PAYMENT_URL = "YOUR_CLOUD_FUNCTION_URL_HERE"; 

const PaymentButton = ({ email, amount, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);

  const componentProps = {
    email,
    amount: amount * 100, // Paystack expects amount in kobo
    publicKey: PAYSTACK_PUBLIC_KEY,
    text: "Pay Now",
    onSuccess: async (reference) => {
      // 1. Payment worked on the client side!
      // 2. Now verifying on backend...
      setLoading(true);
      try {
        const response = await axios.post(CONFIRM_PAYMENT_URL, {
          reference: reference.reference,
          email: email,
          amount: amount * 100
        });

        if (response.data.success) {
          alert("Payment verified and Receipt sent!");
          if (onSuccess) onSuccess();
        } else {
          alert("Payment successful, but verification failed.");
        }
      } catch (error) {
        console.error("Backend verification error:", error);
        alert("Payment successful, but could not connect to server for receipt.");
      } finally {
        setLoading(false);
      }
    },
    onClose: onClose ? onClose : () => alert("Payment cancelled"),
  };

  if (loading) return <span>Verifying...</span>;

  return (
    <div className="payment-btn-container">
      <PaystackButton className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition" {...componentProps} />
    </div>
  );
};

export default PaymentButton;
