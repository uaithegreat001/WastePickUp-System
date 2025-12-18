import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../../lib/firebase.js";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { SERVICE_AREAS } from "../../lib/constants.js";
import Logo from "../../assets/Logo-Transparent.png";

import { FormInput, FormSelect } from "../../components/reusable/FormInput";
import toast from "react-hot-toast";

export default function CreateAccount() {
  const navigate = useNavigate();

  // States
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
  const [serviceArea, setServiceArea] = useState("");
  const [serviceAreaError, setServiceAreaError] = useState("");

  // Spinner state
  const [loading, setLoading] = useState(false);

  // Email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServiceAreaError("");

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
    if (!serviceArea) {
      setServiceAreaError("Please select service area");
      hasError = true;
    }

    if (
      nameError ||
      phoneError ||
      emailError ||
      passwordError ||
      addressError ||
      serviceAreaError ||
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

      // Extract zipcode and lga from selected service area
      const selectedArea = SERVICE_AREAS.find(
        (area) => area.zipcode === serviceArea
      );

      await setDoc(doc(db, "users", user.uid), {
        fullName: name,
        phone,
        email,
        address,
        zipcode: selectedArea.zipcode,
        lga: selectedArea.lga,
        createdAt: new Date(),
        role: "user",
      });

      toast.success("Account created successfully!");

      // Redirect
      navigate("/dashboard");
    } catch (error) {
      console.error("Signup error:", error);

      let message = "Oops, something went wrong please try again.";

      if (error.code === "auth/email-already-in-use") {
        message = "User already exists. Please login instead.";
      } else if (error.code === "auth/invalid-email") {
        message = "Invalid email address.";
      } else if (error.code === "auth/weak-password") {
        message = "Password is too weak.";
      } else if (error.code === "auth/network-request-failed") {
        message = "Network error. Please try again.";
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-3">
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
            <FormInput
              label="Full Name"
              icon="hugeicons:user-03"
              value={name}
              onChange={(e) => handleNameError(e.target.value)}
              placeholder="First Last"
              error={nameError}
            />
          </div>
          {/* Phone number */}
          <div>
            <FormInput
              label="Phone Number"
              icon="hugeicons:call-02"
              type="tel"
              value={phone}
              onChange={(e) => handlePhoneError(e.target.value)}
              placeholder="e.g. 08012345678"
              error={phoneError}
            />
          </div>
          {/* Email */}
          <div>
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
          <div>
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
                  className="text-xs text-gray-500 cursor-pointer hover:underline"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              }
            />
          </div>
          {/* Address */}
          <div>
            <FormInput
              label="Address"
              icon="hugeicons:location-05"
              value={address}
              onChange={(e) => handleAddressError(e.target.value)}
              placeholder="Street, City"
              error={addressError}
            />
          </div>
          {/* Service Area */}
          <div>
            <FormSelect
              label="Select Service Area"
              icon="hugeicons:location-01"
              value={serviceArea}
              onChange={(e) => setServiceArea(e.target.value)}
              error={serviceAreaError}
              options={SERVICE_AREAS.map((area) => ({
                value: area.zipcode,
                label: area.label,
              }))}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded mt-5 cursor-pointer text-white ${
            loading
              ? " border border-gray-400 cursor-not-allowed"
              : "bg-[rgb(36,157,119)] hover:opacity-90"
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
