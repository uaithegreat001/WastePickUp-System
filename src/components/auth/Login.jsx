import { useState } from "react";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";

export default function Login() {
  // States
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [agree, setAgree] = useState(false);
  const [agreeError, setAgreeError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Email pattern validation
  const emailRegex = /^[^\s@]+@(gmail|yahoo|hotmail|outlook)\.com$/i;

  // Password patterns validation
  const hasUppercase = /[A-Z]/;
  const hasLowercase = /[a-z]/;
  const hasNumber = /[0-9]/;
  const hasSpecial = /[^A-Za-z0-9]/;

  // Email validation
  const handleEmailError = (value) => {
    const emailValue = value.replace(/\s/g, "");
    setEmail(emailValue);

    if (!emailValue) return setEmailError("Please enter email");
    if (!emailRegex.test(emailValue))
      return setEmailError("Oops, this appears to be an invalid email");
    setEmailError("");
  };

  // Password validation
  const handlePasswordError = (value) => {
    const passwordValue = value.replace(/\s/g, "");
    setPassword(passwordValue);

    if (!passwordValue) return setPasswordError("Please enter password");
    if (passwordValue.length < 8)
      return setPasswordError("Password must be at least 8 characters");
    if (!hasUppercase.test(passwordValue))
      return setPasswordError("Must include an uppercase letter");
    if (!hasLowercase.test(passwordValue))
      return setPasswordError("Must include a lowercase letter");
    if (!hasNumber.test(passwordValue))
      return setPasswordError("Must include a number");
    if (!hasSpecial.test(passwordValue))
      return setPasswordError("Must include a special character");

    setPasswordError("");
  };

  // Submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess("");
    setAgreeError("");

    let hasError = false;

    if (!email) {
      setEmailError("Please enter email");
      hasError = true;
    }
    if (!password) {
      setPasswordError("Please enter password");
      hasError = true;
    }
    if (!agree) {
      setAgreeError("You must agree to the Terms and Privacy");
      hasError = true;
    }

    if (emailError || passwordError || hasError) return;

    // Simulate success → later DB check will decide if user is admin or normal user
    setSuccess("Login Successful! Redirecting...");
    setTimeout(() => {
      console.log("Redirecting... will check role from DB here.");
      window.location.href = "/dashboard"; // placeholder → will update with DB role
    }, 2000);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center  px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg border border-gray-300  bg-gray-50  p-8 rounded-lg"
        noValidate
      >
        {/* Heading */}
        <h2 className="text-xl font-semibold mb-2 text-center">
          Welcome back to <span className="text-[rgb(36,157,119)]">WastePickUp</span>
        </h2>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Clean homes, Stay hygienic
        </p>

        {/* Success message */}
        {success && (
          <div className="bg-green-100 text-green-700 text-sm p-2 rounded mb-4 text-center">
            {success}
          </div>
        )}

        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm mb-1">Email</label>
          <div className="flex items-center border rounded px-2">
            <Icon icon="mdi:email-outline" className="text-gray-500" />
            <input
              type="email"
              className="flex-1 p-2 outline-none"
              value={email}
              onChange={(e) => handleEmailError(e.target.value)}
              placeholder="Enter email"
            />
          </div>
          {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="block text-sm mb-1">Password</label>
          <div className="flex items-center border rounded px-2">
            <Icon icon="mdi:lock-outline" className="text-gray-500" />
            <input
              type={showPassword ? "text" : "password"}
              className="flex-1 p-2 outline-none"
              value={password}
              onChange={(e) => handlePasswordError(e.target.value)}
              placeholder="Enter password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="ml-2 text-xs text-[rgb(36,157,119)] hover:underline"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {passwordError && (
            <p className="text-red-500 text-xs mt-1">{passwordError}</p>
          )}
          <div className="text-right mt-1">
            <Link
              to="/forgot-password"
              className="text-xs text-[rgb(36,157,119)] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {/* Terms */}
        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            id="agree"
            className="w-4 h-4 accent-[rgb(36,157,119)] mr-2"
            checked={agree}
            onChange={() => setAgree(!agree)}
          />
          <label htmlFor="agree" className="text-sm gap-1 flex flex-wrap">
            I agree with the{" "}
            <Link to="/TermsPrivacy" className="hover:underline">
              Terms and Privacy
            </Link>
          </label>
        </div>
        {agreeError && <p className="text-red-500 text-xs mb-2">{agreeError}</p>}

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-[rgb(36,157,119)] text-white py-2 rounded hover:opacity-90 transition"
        >
          Login
        </button>

        {/* Signup link */}
        <p className="mt-4 text-sm text-center">
          Don’t have an account?{" "}
          <Link to="/CreateAccount" className="text-[rgb(36,157,119)] hover:underline">
            Create account
          </Link>
        </p>
      </form>
    </div>
  );
}
