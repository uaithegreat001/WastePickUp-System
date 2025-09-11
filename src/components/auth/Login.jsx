import { useState } from "react";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import Logo from "../../assets/Logo-Transparent.png";

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
        className="w-full max-w-lg border border-gray-300  bg-gray-50  p-8 rounded-lg text-gray-600"
        noValidate
      >
        <div className="flex mb-4 flex-col  mx-auto max-w-45 items-center ">
          <img src={Logo} alt="Wastepickup logo" className="max-w-35 h-auto" />
          <p className="text-sm text-gray-400 mb-4 text-center">Clean homes, Stay hygienic</p>
        </div>

        {/* Success message */}
        {success && (
          <div className="bg-green-100 text-green-700 text-sm p-2 rounded mb-4 text-center">
            {success}
          </div>
        )}

        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm mb-1 text-gray-500">Email</label>
          <div className="flex items-center border rounded px-2  border-gray-400">
            <Icon icon="hugeicons:mail-01" width="18" height="18" className="text-gray-400" />

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
          <label className="block text-sm mb-1 text-gray-500">Password</label>
          <div className="flex items-center border rounded px-2  border-gray-400">
            <Icon icon="hugeicons:square-lock-password" width="20" height="20" className="text-gray-400" />


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
          <div className="text-gray-500 text-sm mt-5 mb-5 flex justify-start items-center gap-1">
            <span>
              Forgot password?
            </span>
            <Link
              to="/ForgotPassword"
              className="text-sm text-[rgb(36,157,119)] hover:underline"
            >              Reset password?
            </Link>
          </div>
        </div>

        {/* Terms */}
        <div className="mb-4 flex items-center  text-gray-500">
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
