
import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import Logo from "../../assets/Logo-Transparent.png";

export default function ForgotPassword() {
  // States
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  // Email pattern validation (same as Login/CreateAccount)
  const emailRegex = /^[^\s@]+@(gmail|yahoo|hotmail|outlook)\.com$/i;

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
  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess("");
    let hasError = false;
    if (!email) {
      setEmailError("Please enter email");
      hasError = true;
    }
    if (emailError || hasError) return;
    // Simulate sending reset link
    setSuccess("Password reset link sent to your email!");
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);
  };

  // Smooth popup animation
  // Add custom styles for modal overlay and popup
  return (
  <div className="min-h-screen w-full flex items-center justify-center px-2 sm:px-4  relative">
      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-gray-50 rounded-xl shadow-2xl px-4 py-4 sm:px-8 sm:py-6 flex flex-col items-center w-11/12 max-w-md">
            <Icon icon="mdi:check-circle" width="40" height="40" className="text-green-500 mb-2" />
            <h3 className="text-base sm:text-lg font-semibold text-green-700 mb-2">Success!</h3>
            <p className="text-gray-600 text-center mb-2 text-sm sm:text-base">{success}</p>
          </div>
        </div>
      )}

      {/* Main Form Card */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg sm:max-w-md md:max-w-lg border border-gray-300 bg-gray-50 p-4 sm:p-8 rounded-lg text-gray-600  transition-all duration-700"
        noValidate
      >
        <div className="flex mb-4 flex-col mx-auto items-center ">
          <img src={Logo} alt="Wastepickup logo" className="w-24 sm:w-32 md:w-36 h-auto" />
          <p className="text-xs sm:text-sm text-gray-400 mb-4 text-center">Clean homes, Stay hygienic</p>
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-xs sm:text-sm mb-1 text-gray-500">Email</label>
          <div className="flex items-center border rounded px-2 border-gray-400">
            <Icon icon="hugeicons:mail-01" width="16" height="16" className="text-gray-400" />
            <input
              type="email"
              className="flex-1 p-2 outline-none text-sm sm:text-sm"
              value={email}
              onChange={(e) => handleEmailError(e.target.value)}
              placeholder="Enter email"
            />
          </div>
          {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-[rgb(36,157,119)] text-white py-2 rounded hover:opacity-90 transition text-xs sm:text-sm"
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

      {/* No custom animations */}
    </div>
  );
}