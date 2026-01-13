import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "./authService";

import Logo from "../../assets/Logo-Transparent.png";

import { FormInput } from "../../components/reusable/FormInput";
import toast from "react-hot-toast";

export default function CreateAccount() {
  const navigate = useNavigate();

  // Form states
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Loading state
  const [loading, setLoading] = useState(false);

  // Email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  // Password checks
  const hasUppercase = /[A-Z]/;
  const hasLowercase = /[a-z]/;
  const hasNumber = /[0-9]/;
  const hasSpecial = /[^A-Za-z0-9]/;

  // Validate name field
  const handleNameError = (value) => {
    setName(value);
    if (!value.trim()) return setNameError("Please enter your full name");
    if (!/^[A-Za-z\s]+$/.test(value))
      return setNameError("Oops, this appears to be an invalid full name");
    const parts = value.trim().split(" ");
    if (parts.length < 2) return setNameError("Please enter full name");
    setNameError("");
  };

  // Validate phone field
  const handlePhoneError = (value) => {
    setPhone(value);
    if (!/^0\d{10}$/.test(value))
      return setPhoneError("Phone number must start with 0 and be 11 digits");
    setPhoneError("");
  };

  // Validate email field
  const handleEmailError = (value) => {
    const emailValue = value.replace(/\s/g, "");
    setEmail(emailValue);
    if (!emailValue) return setEmailError("Please enter email");
    if (!emailRegex.test(emailValue))
      return setEmailError("Oops, this appears to be an invalid email");
    setEmailError("");
  };

  // Validate password field
  const handlePasswordError = (value) => {
    const passwordValue = value.replace(/\s/g, "");
    setPassword(passwordValue);
    if (!passwordValue) return setPasswordError("Please enter password");
    if (passwordValue.length < 8 || passwordValue.length > 15)
      return setPasswordError("Password must be 8-15 characters");
    if (!hasUppercase.test(passwordValue))
      return setPasswordError("Must include uppercase letter");
    if (!hasLowercase.test(passwordValue))
      return setPasswordError("Must include lowercase letter");
    if (!hasNumber.test(passwordValue))
      return setPasswordError("Must include a number");
    if (!hasSpecial.test(passwordValue))
      return setPasswordError("Must include special character");
    setPasswordError("");
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    let hasError = false;
    if (!name) {
      setNameError("Please enter your full name");
      hasError = true;
    }
    if (!phone) {
      setPhoneError("Please enter phone number");
      hasError = true;
    }
    if (!email) {
      setEmailError("Please enter email");
      hasError = true;
    }
    if (!password) {
      setPasswordError("Please enter password");
      hasError = true;
    }

    if (nameError || phoneError || emailError || passwordError || hasError)
      return;

    try {
      setLoading(true);

      const profileData = {
        fullName: name,
        phone,
        role: "user",
      };

      await authService.createAccount(email, password, profileData);

      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (error) {
      let errorMessage = "Oops, something went wrong please try again.";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "User already exists. Please login instead.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak.";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please try again.";
      } else if (error.code === "permission-denied") {
        errorMessage =
          "Permission denied. Please check your account or contact support.";
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-3">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg p-8 px-2 rounded-lg text-gray-600 bg-transparent"
        noValidate
      >
        <div className="flex mb-4 flex-col mx-auto max-w-45 items-center">
          <img src={Logo} alt="Wastepickup logo" className="max-w-35 h-auto" />
          <p className="text-sm text-gray-400 mb-4 text-center">
            Clean homes, Stay hygienic
          </p>
        </div>

        {/* Full Name */}
        <div className="mb-4">
          <FormInput
            label="Full Name"
            value={name}
            onChange={(e) => handleNameError(e.target.value)}
            placeholder="First Last"
            error={nameError}
          />
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

        {/* Phone Number */}
        <div className="mb-4">
          <FormInput
            label="Phone Number"
            type="tel"
            value={phone}
            onChange={(e) => handlePhoneError(e.target.value)}
            placeholder="e.g. 08012345678"
            error={phoneError}
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <FormInput
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => handlePasswordError(e.target.value)}
            placeholder="Enter password"
            error={passwordError}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-gray-500 cursor-pointer hover:underline"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            }
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={
            loading ||
            !name ||
            !phone ||
            !email ||
            !password ||
            !!nameError ||
            !!phoneError ||
            !!emailError ||
            !!passwordError
          }
          className={
            `w-full py-2 rounded text-white transition ` +
            `${
              loading ||
              !name ||
              !phone ||
              !email ||
              !password ||
              !!nameError ||
              !!phoneError ||
              !!emailError ||
              !!passwordError
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[rgb(36,157,119)] hover:opacity-90 cursor-pointer"
            }`
          }
        >
          {loading ? "Processing..." : "Create Account"}
        </button>

        {/* Login account link */}
        <p className="mt-4 text-sm text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-[rgb(36,157,119)] hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
