import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../lib/firebase.js";
import Logo from "../../assets/Logo-Transparent.png";
import toast from "react-hot-toast";
import { FormInput } from "../../components/reusable/FormInput";

export default function ForgotPassword() {
  // States
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  // Email pattern validation (same as Login/CreateAccount)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  // Email validation
  const handleEmailError = (value) => {
    const emailValue = value.replace(/\s/g, "");
    setEmail(emailValue);
    if (!emailValue) return setEmailError("Please enter email");
    if (!emailRegex.test(emailValue))
      return setEmailError("Oops, this appears to be an invalid email");
    setEmailError("");
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    let hasError = false;
    if (!email) {
      setEmailError("Please enter email");
      hasError = true;
    }
    if (emailError || hasError) return;

    try {
      await sendPasswordResetEmail(auth, email, {
        // Redirect back to your app after reset
        url: window.location.origin + "/login",
        handleCodeInApp: false, // ✅ Let Firebase use its default reset page
      });

      toast.success("Password reset link sent to your email!");
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        toast.error("Account not found please create one");
      } else {
        toast.error("Oops, network error please try again");
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-2 sm:px-4 relative">
      {/* Main Form Card */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg sm:max-w-md md:max-w-lg border border-gray-300 bg-gray-50 p-4 sm:p-8 rounded-lg text-gray-600 transition-all duration-700"
        noValidate
      >
        <div className="flex mb-4 flex-col mx-auto items-center">
          <img
            src={Logo}
            alt="Wastepickup logo"
            className="w-24 sm:w-32 md:w-36 h-auto"
          />
          <p className="text-xs sm:text-sm text-gray-400 mb-4 text-center">
            Clean homes, Stay hygienic
          </p>
        </div>

        {/* Email */}
        <div className="mb-4">
          <FormInput
            label="Email"
            icon="hugeicons:mail-01"
            type="email"
            value={email}
            onChange={(e) => handleEmailError(e.target.value)}
            placeholder="Enter email"
            error={emailError}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-[rgb(36,157,119)] cursor-pointer text-white py-2 rounded hover:opacity-90 transition text-xs sm:text-sm"
        >
          Send Reset Link
        </button>

        {/* Back to login link */}
        <p className="mt-4 text-xs sm:text-sm text-center">
          Remembered your password?{" "}
          <Link to="/login" className="text-[rgb(36,157,119)] hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
