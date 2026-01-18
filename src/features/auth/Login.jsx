import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "./authService";
import Logo from "../../assets/Logo-Transparent.png";

import { FormInput } from "../../components/reusable/FormInput";
import toast from "react-hot-toast";

export default function Login() {
  const navigate = useNavigate();

  // States
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // Spinner loading state
  const [loading, setLoading] = useState(false);

  // Email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  // Password checks
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
    if (passwordValue.length < 8 || passwordValue.length > 15)
      return setPasswordError("Password must be 8-15 characters");
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
  const handleSubmit = async (e) => {
    e.preventDefault();

    let hasError = false;
    if (!email) {
      setEmailError("Please enter email");
      hasError = true;
    }
    if (!password) {
      setPasswordError("Please enter password");
      hasError = true;
    }

    if (emailError || passwordError || hasError) return;

    try {
      setLoading(true);

      const result = await authService.login(email, password);
      const { userData } = result;
      const role = userData?.role || "user";

      toast.success("Login successful");

      // Redirect based on role
      if (role === "admin") {
        navigate("/admin/dashboard");
      } else if (role === "collector") {
        navigate("/collector/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      let errorMessage = "Oops, something went wrong please try again";
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/invalid-credential"
      ) {
        errorMessage = "Invalid email or password";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Invalid email or password";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many attempts. Try again later";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your connection";
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
    <div className="min-h-screen w-full flex items-center justify-center px-3">
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
                className="text-xs cursor-pointer text-gray-500 hover:underline"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            }
          />
          <div className="text-gray-500 text-sm mt-2 mb-5 flex justify-start items-center gap-1">
            <span>Forgot password?</span>
            <Link
              to="/forgotpassword"
              className="text-sm text-[rgb(36,157,119)] hover:underline"
            >
              Reset password
            </Link>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={
            loading || !email || !password || !!emailError || !!passwordError
          }
          className={`w-full py-2 rounded text-white transition ${
            loading || !email || !password || !!emailError || !!passwordError
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[rgb(36,157,119)] hover:opacity-90 cursor-pointer"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Creating account link */}
        <p className="mt-4 text-sm text-center">
          Don't have an account?{" "}
          <Link
            to="/createaccount"
            className="text-[rgb(36,157,119)] hover:underline"
          >
            Create account
          </Link>
        </p>
      </form>
    </div>
  );
}
