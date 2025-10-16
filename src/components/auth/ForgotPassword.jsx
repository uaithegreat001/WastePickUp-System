import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebaseConfig.js";
import Disclaimer from "../../components/ui/Disclaimer.jsx";
import Logo from "../../assets/Logo-Transparent.png";
import SuccessPopup from "../../components/ui/SuccessPopUp.jsx";
import ErrorPopup from "../../components/ui/ErrorPopUp.jsx";
import Spinner from "../../components/ui/Spinner.jsx";

export default function ForgotPassword() {
  // States
    const [disclaimer, setDisclaimer] = useState(true);
  
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [loading, setLoading] = useState(false);

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
  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowSuccess(false);
    setShowError(false);
    setPopupMessage("");

    let hasError = false;
    if (!email) {
      setEmailError("Please enter email");
      hasError = true;
    }
    if (emailError || hasError) return;

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email, {
         // Redirect back to your app after reset
      url: window.location.origin + "/login",
      handleCodeInApp: false // ✅ Let Firebase use its default reset page

      });
     
      setLoading(false);

      setPopupMessage("Password reset link sent to your email!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
    } catch (error) {
      setLoading(false);
      if (error.code === "auth/user-not-found") {
        setPopupMessage("Account not found please create one");
      } else {
        setPopupMessage("Oops, network error please try again");
      }
      setShowError(true);
      setTimeout(() => setShowError(false), 4000);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-2 sm:px-4 relative">
      <Disclaimer
              show={disclaimer}
              title ="Note:"
              message="Please check your spam folder if email send to you not found!"
              onClose={() => setDisclaimer(false)}
              className="!max-w-lg sm:!max-w-md md:!max-w-lg bg-blue-100 " />
      {/* Spinner */}
      <Spinner show={loading} message="Sending reset link..." />

      {/* Reusable Popups */}
      <SuccessPopup show={showSuccess} message={popupMessage} />
      <ErrorPopup show={showError} message={popupMessage} />

      {/* Main Form Card */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg sm:max-w-md md:max-w-lg border border-gray-300 bg-gray-50 p-4 sm:p-8 rounded-lg text-gray-600 transition-all duration-700"
        noValidate
      >
        <div className="flex mb-4 flex-col mx-auto items-center">
          <img src={Logo} alt="Wastepickup logo" className="w-24 sm:w-32 md:w-36 h-auto" />
          <p className="text-xs sm:text-sm text-gray-400 mb-4 text-center">
            Clean homes, Stay hygienic
          </p>
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-xs sm:text-sm mb-1 text-gray-500">Email</label>
          <div className="flex items-center border rounded px-2 border-gray-400">
            <Icon
              icon="hugeicons:mail-01"
              width="16"
              height="16"
              className="text-gray-400"
            />
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
