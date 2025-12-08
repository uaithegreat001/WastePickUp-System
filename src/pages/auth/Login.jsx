import { useState } from "react";
import { Icon } from "@iconify/react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../../lib/firebase.js";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Logo from "../../assets/Logo-Transparent.png";
import LoadingBox from "../../components/common/LoadingBox";
import ErrorBox from "../../components/common/ErrorBox";
import { FormInput } from "../../components/common/FormInput";

export default function Login() {
  const navigate = useNavigate();
  
  // States
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [agree, setAgree] = useState(false);
  const [agreeError, setAgreeError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Popup & spinner states
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  // Email regex
  const emailRegex = /^[^\s@]+@(gmail|yahoo|hotmail|outlook)\.com$/i;

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

  // Submit form function
  const handleSubmit = async (e) => {
    e.preventDefault();
    setAgreeError("");
    setShowError(false);
    setShowSuccess(false);
    setPopupMessage("");

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

    try {
      setLoading(true);

      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check role in Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      let role = "user";
      if (userDoc.exists()) {
        role = userDoc.data().role || "user";
      }

      setLoading(false);
      setPopupMessage("Login successful!");
      setShowSuccess(true);

      // Directing user base on role
      setTimeout(() => {
        if (role === "admin") {
          navigate("/admin-dashboard");
        } else {
          navigate("/dashboard");
        }
      }, 2000);
    } catch (error) {
      setLoading(false);
      console.error("Login error:", error);
      console.log("Firebase error code:", error.code);

      if (error.code === "auth/user-not-found") {
        setPopupMessage("Account not found please create one");
      } else if (error.code === "auth/wrong-password") {
        setPopupMessage("Oops, incorrect password please try again");
      } else if (error.code === "auth/too-many-requests") {
        setPopupMessage("Too many attempt try again later");
      } else if (error.code === "auth/network-request-failed") {
        setPopupMessage("Oops, network error please try again");
      } else {
        setPopupMessage("Oops, something went wrong please try again");
      }
      setShowError(true);
      // Hide error
      setTimeout(() => {
        setShowError(false);
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-3">
      <LoadingBox show={loading} message="Logging you in..." />
      <ErrorBox show={showError} message={popupMessage} onClose={() => setShowError(false)} />

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg border border-gray-300 bg-gray-50 p-8 rounded-lg text-gray-600"
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
            icon="hugeicons:mail-01"
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
            icon="hugeicons:square-lock-password"
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
            <Link to="/ForgotPassword" className="text-sm text-[rgb(36,157,119)] hover:underline">
              Reset password
            </Link>
          </div>
        </div>

        {/* Checkbox */}
        <div className="mb-4 flex items-center text-gray-500">
          <input
            type="checkbox"
            id="agree"
            className=" cursor-pointer w-4 h-4 accent-[rgb(36,157,119)] mr-2"
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
          className="w-full bg-[rgb(36,157,119)] cursor-pointer text-white py-2 rounded hover:opacity-90 transition"
        >
          Login
        </button>

        {/* Creating account link */}
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
