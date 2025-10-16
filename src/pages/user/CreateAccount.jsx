import { useState } from "react";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import { auth, db } from "../../firebaseConfig.js";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import Disclaimer from "../../components/ui/Disclaimer.jsx";
import Logo from "../../assets/Logo-Transparent.png";
import SuccessPopup from "../../components/ui/SuccessPopUp.jsx";
import ErrorPopup from "../../components/ui/ErrorPopUp.jsx";
import Spinner from "../../components/ui/Spinner.jsx";

export default function CreateAccount() {
  // States
  const [disclaimer, setDisclaimer] = useState(true);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [address, setAddress] = useState("");
  const [addressError, setAddressError] = useState("");
  const [zip, setZip] = useState("");
  const [zipError, setZipError] = useState("");
  const [lga, setLga] = useState("");
  const [lgaError, setLgaError] = useState("");
  const [agree, setAgree] = useState(false);
  const [agreeError, setAgreeError] = useState("");

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
  // Name validation
  const handleNameError = (value) => {
    setName(value);
    if (!value.trim()) return setNameError("Please enter your full name");
    if (!/^[A-Za-z\s]+$/.test(value))
      return setNameError("Oops, this appears to be an invalid full name");
    const parts = value.trim().split(" ");
    if (parts.length < 2) return setNameError("Please enter full name");
    setNameError("");
  };
  // Phone validation
  const handlePhoneError = (value) => {
    setPhone(value);
    if (!/^0\d{10}$/.test(value))
      return setPhoneError("Phone number must start with 0 and be 11 digits");
    setPhoneError("");
  };
  // Email validation
  const handleEmailError = (value) => {
    const clean = value.replace(/\s/g, "");
    setEmail(clean);
    if (!clean) return setEmailError("Please enter email");
    if (!emailRegex.test(clean))
      return setEmailError("Oops, this appears to be an invalid email");
    setEmailError("");
  };
  // Password validation
  const handlePasswordError = (value) => {
    const pass = value.replace(/\s/g, "");
    setPassword(pass);
    if (!pass) return setPasswordError("Please enter password");
    if (pass.length < 8 || pass.length > 15)
      return setPasswordError("Password must be 8-15 characters");
    if (!hasUppercase.test(pass))
      return setPasswordError("Must include uppercase letter");
    if (!hasLowercase.test(pass))
      return setPasswordError("Must include lowercase letter");
    if (!hasNumber.test(pass)) return setPasswordError("Must include a number");
    if (!hasSpecial.test(pass))
      return setPasswordError("Must include special character");
    setPasswordError("");
  };
  // Address validation
  const handleAddressError = (value) => {
    setAddress(value);
    if (!value.trim()) return setAddressError("Please enter address");
    if (!/^[A-Za-z0-9\s,.-]+$/.test(value))
      return setAddressError("Invalid characters in address");
    setAddressError("");
  };
  // ZipCode validation
  const handleZipError = (value) => {
    setZip(value);
    if (!value) return setZipError("Please enter zip code");
    if (!/^\d{5,6}$/.test(value))
      return setZipError("Zip code must be 5 or 6 digits");
    setZipError("");
  };
  // Submit form function
  const handleSubmit = async (e) => {
    e.preventDefault();
    setAgreeError("");
    setLgaError("");
    setShowError(false);
    setShowSuccess(false);
    setPopupMessage("");

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
    if (!address) {
      setAddressError("Please enter address");
      hasError = true;
    }
    if (!zip) {
      setZipError("Please enter zip code");
      hasError = true;
    }
    if (!lga) {
      setLgaError("Please select LGA");
      hasError = true;
    }
    if (!agree) {
      setAgreeError("You must agree to the Terms and Privacy");
      hasError = true;
    }

    if (
      nameError ||
      phoneError ||
      emailError ||
      passwordError ||
      addressError ||
      zipError ||
      lgaError ||
      hasError
    )
      return;

    try {
      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        fullName: name,
        phone,
        email,
        address,
        zip,
        lga,
        createdAt: new Date(),
        role: "user",
      });

      setLoading(false);
      setPopupMessage("Account created successfully!");
      setShowSuccess(true);

      // Hide successs and redirect
      setTimeout(() => {
        setShowSuccess(false);
        window.location.href = "/dashboard";
      }, 2000);
    } catch (error) {
      setLoading(false);

      if (error.code === "auth/email-already-in-use") {
        setPopupMessage("Oops, User already exists please try login");
      } else if (error.code === "auth/invalid-email") {
        setPopupMessage("Oops, invalid email address");
      } else if (error.code === "auth/weak-password") {
        setPopupMessage("Oops, password is too weak");
      } else if (error.code === "auth/network-request-failed") {
        setPopupMessage("Oops, network error please try again");
      } else {
        setPopupMessage("Oops, something went wrong please try again.");
      }

      setShowError(true);

      // Hide error
      setTimeout(() => {
        setShowError(false);
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-3">
      <Disclaimer
        show={disclaimer}
        title="Disclaimer:"
        message="For accurate scheduling and timely delivery of services, please provide your exact personal information when creating your account!"
        onClose={() => setDisclaimer(false)}
        className={" bg-blue-100 "}
      />
      {/* Spinner + Popups */}
      <Spinner show={loading} message="Creating your account..." />
      <SuccessPopup show={showSuccess} message={popupMessage} />
      <ErrorPopup show={showError} message={popupMessage} />

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl border border-gray-300 bg-gray-50 p-7 rounded-lg text-gray-600"
        noValidate
      >
        <div className="flex mb-4 flex-col  mx-auto max-w-45 items-center ">
          <img src={Logo} alt="Wastepickup logo" className="max-w-35 h-auto" />
          <p className="text-sm text-gray-400 mb-4 text-center">
            Clean homes, Stay hygienic
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className="block text-sm mb-1 text-gray-500">Full Name</label>
            <div className="flex items-center border rounded border-gray-400 px-2">
              <Icon icon="hugeicons:user-03" width="24" height="24" className="text-gray-400" />
              <input
                type="text"
                className="flex-1 p-2 outline-none border-gray-400"
                value={name}
                onChange={(e) => handleNameError(e.target.value)}
                placeholder="First Last"
              />
            </div>
            {nameError && (
              <p className="text-red-500 text-xs mt-1">{nameError}</p>
            )}
          </div>
          {/* Phone number */}
          <div>
            <label className="block text-sm mb-1 text-gray-500">Phone Number</label>
            <div className="flex items-center border rounded border-gray-400 px-2">
              <Icon icon="hugeicons:call-02" width="18" height="18" className="text-gray-400" />
              <input
                type="tel"
                className="flex-1 p-2 outline-none border-gray-400"
                value={phone}
                onChange={(e) => handlePhoneError(e.target.value)}
                placeholder="e.g. 08012345678"
              />
            </div>
            {phoneError && (
              <p className="text-red-500 text-xs mt-1">{phoneError}</p>
            )}
          </div>
          {/* Email */}
          <div>
            <label className="block text-sm mb-1 text-gray-500">Email</label>
            <div className="flex items-center border rounded border-gray-400 px-2">
              <Icon icon="hugeicons:mail-01" width="18" height="18" className="text-gray-400" />
              <input
                type="email"
                className="flex-1 p-2 outline-none border-gray-400"
                value={email}
                onChange={(e) => handleEmailError(e.target.value)}
                placeholder="Enter email"
              />
            </div>
            {emailError && (
              <p className="text-red-500 text-xs mt-1">{emailError}</p>
            )}
          </div>
          {/* Password */}
          <div>
            <label className="block text-sm mb-1 text-gray-500">Password</label>
            <div className="flex items-center border border-gray-400 rounded px-2">
              <Icon icon="hugeicons:square-lock-password" width="20" height="20" className="text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                className="flex-1 p-2 outline-none "
                value={password}
                onChange={(e) => handlePasswordError(e.target.value)}
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="ml-2 text-xs text-gray-500 cursor-pointer hover:underline"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {passwordError && (
              <p className="text-red-500 text-xs mt-1">{passwordError}</p>
            )}
          </div>
          {/* Address */}
          <div>
            <label className="block text-sm mb-1 text-gray-500">Address</label>
            <div className="flex items-center border rounded border-gray-400 px-2">
              <Icon icon="hugeicons:location-05" width="20" height="20" className="text-gray-400" />
              <input
                type="text"
                className="flex-1 p-2 outline-none border-gray-400"
                value={address}
                onChange={(e) => handleAddressError(e.target.value)}
                placeholder="Street, City"
              />
            </div>
            {addressError && (
              <p className="text-red-500 text-xs mt-1">{addressError}</p>
            )}
          </div>
          {/* LGA */}
          <div>
            <label className="block text-sm mb-1 text-gray-500">LGA</label>
            <div className="flex items-center border rounded border-gray-400 px-2">
              <Icon icon="hugeicons:location-01" width="18" height="18" className="text-gray-400" />
              <select
                className="flex-1 p-2 outline-none border-gray-400"
                value={lga}
                onChange={(e) => setLga(e.target.value)}
              >
                <option value="">Select LGA</option>
                <option value="Gwale">Gwale</option>
                <option value="Nassarawa">Nassarawa</option>
                <option value="Tarauni">Tarauni</option>
              </select>
            </div>
            {lgaError && (
              <p className="text-red-500 text-xs mt-1">{lgaError}</p>
            )}
          </div>
          {/* ZipCode */}
          <div>
            <label className="block text-sm mb-1 text-gray-500">Zip Code</label>
            <div className="flex items-center border rounded border-gray-400 px-2">
              <Icon icon="hugeicons:location-01" width="18" height="18" className="text-gray-400" />
              <input
                type="text"
                className="flex-1 p-2 outline-none border-gray-400"
                value={zip}
                onChange={(e) => handleZipError(e.target.value)}
                placeholder="e.g. 700001"
              />
            </div>
            {zipError && (
              <p className="text-red-500 text-xs mt-1">{zipError}</p>
            )}
          </div>
        </div>
        {/* CheckBox*/}
        <div className="mt-5 flex items-center">
          <input
            type="checkbox"
            id="agree"
            className="w-4 h-4 cursor-pointer accent-[rgb(36,157,119)] mr-2 "
            checked={agree}
            onChange={() => setAgree(!agree)}
          />
          <label htmlFor="agree" className="text-sm gap-1  flex flex-wrap text-gray-500">
            I agree with the
            <Link to="/TermsPrivacy" className="hover:underline">
              Terms and Privacy
            </Link>
          </label>
        </div>
        {agreeError && (
          <p className="text-red-500 text-xs mb-2">{agreeError}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded mt-3 cursor-pointer text-white ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-[rgb(36,157,119)] hover:opacity-90"
            }`}
        >
          {loading ? "Processing..." : "Create Account"}
        </button>
        {/* Login to account link */}
        <p className="mt-3 text-sm text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-[rgb(36,157,119)]">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
