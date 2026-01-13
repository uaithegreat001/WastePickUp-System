import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import { authService } from "./authService";
import Logo from "../../assets/Logo-Transparent.png";
import toast from "react-hot-toast";
import { FormInput } from "../../components/reusable/FormInput";

export default function ForgotPassword() {
  // States
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  // Spinner loading state
  const [loading, setLoading] = useState(false);

  // Email regex
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
      setLoading(true);
      await authService.forgotPassword(email, {
        url: window.location.origin + "/login",
        handleCodeInApp: false,
      });

      toast.success("Password reset link sent to your email!");
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        toast.error("Account not found please create one");
      } else {
        toast.error("Oops, network error please try again");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-2 sm:px-4 relative">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg sm:max-w-md md:max-w-lg bg-transparent p-4 px-2 sm:p-8 rounded-lg text-gray-600 transition-all duration-700"
        noValidate
      >
        <div className="flex mb-4 flex-col mx-auto max-w-45 items-center">
          <img src={Logo} alt="Wastepickup logo" className="max-w-35 h-auto" />
          <p className="text-sm text-gray-400 mb-4 text-center">
            Clean homes, Stay hygienic
          </p>
        </div>

        {/* Email */}
        <div className="mb-4">
          <FormInput
            label="Email"
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
          disabled={loading || !email || !!emailError}
          className={`w-full py-2 rounded text-white transition ${
            loading || !email || !!emailError
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[rgb(36,157,119)] hover:opacity-90 cursor-pointer"
          } text-xs sm:text-sm`}
        >
          {loading ? "Sending..." : "Send Reset Link"}
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
