import { useState } from "react";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";

export default function CreateAccount() {
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [address, setAddress] = useState("");
  const [addressError, setAddressError] = useState("");
  const [zip, setZip] = useState("");
  const [zipError, setZipError] = useState("");
  const [lga, setLga] = useState("");
  const [lgaError, setLgaError] = useState("");
  const [agree, setAgree] = useState(false);
  const [agreeError, setAgreeError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Email validation
  const emailRegex = /^[^\s@]+@(gmail|yahoo|hotmail|outlook)\.com$/i;

  // ✅ Password checks
  const hasUppercase = /[A-Z]/;
  const hasLowercase = /[a-z]/;
  const hasNumber = /[0-9]/;
  const hasSpecial = /[^A-Za-z0-9]/;

  // ✅ Name validation
  const handleNameChange = (value) => {
    setName(value);
    if (!value.trim()) return setNameError("Please enter your full name");
    if (!/^[A-Za-z\s]+$/.test(value))
      return setNameError("Oops, this appears to be an invalid full name");
    const parts = value.trim().split(" ");
    if (parts.length < 2) return setNameError("Please enter full name");
    setNameError("");
  };

  // ✅ Phone validation (Nigerian standard: 11 digits, must start with 0)
  const handlePhoneChange = (value) => {
    setPhone(value);
    if (!/^0\d{10}$/.test(value))
      return setPhoneError("Phone number must start with 0 and be 11 digits");
    setPhoneError("");
  };

  // ✅ Email validation
  const handleEmailChange = (value) => {
    const clean = value.replace(/\s/g, "");
    setEmail(clean);
    if (!clean) return setEmailError("Please enter email");
    if (!emailRegex.test(clean))
      return setEmailError("Oops, this appears to be an invalid email");
    setEmailError("");
  };

  // ✅ Password validation
  const handlePasswordChange = (value) => {
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

  // ✅ Address validation
  const handleAddressChange = (value) => {
    setAddress(value);
    if (!value.trim()) return setAddressError("Please enter address");
    if (!/^[A-Za-z0-9\s,.-]+$/.test(value))
      return setAddressError("Invalid characters in address");
    setAddressError("");
  };

  // ✅ Zip validation
  const handleZipChange = (value) => {
    setZip(value);
    if (!value) return setZipError("Please enter zip code");
    if (!/^\d{5,6}$/.test(value))
      return setZipError("Zip code must be 5 or 6 digits");
    setZipError("");
  };

  // ✅ Submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess("");
    setAgreeError("");
    setLgaError("");

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

    // ✅ Passed all checks
    setSuccess("Account created successfully!");
    setTimeout(() => {
      console.log({
        name,
        phone,
        email,
        address,
        zip,
        lga,
      });
      window.location.href = "/dashboard";
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl border border-gray-300 bg-gray-50 p-6 rounded-lg"
        noValidate
      >
        <h2 className="text-lg font-semibold mb-2">
          Create your{" "}
          <span className="text-[rgb(36,157,119)]">WastePickUp</span> Account
        </h2>
        <p className="text-sm text-gray-500 mb-4">Clean homes, Stay hygienic</p>

        {success && (
          <div className="bg-green-100 text-green-700 text-sm p-2 rounded mb-3">
            {success}
          </div>
        )}

        {/* 2-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className="block text-sm mb-1">Full Name</label>
            <input
              type="text"
              className="w-full border rounded p-2 outline-none"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="First Last"
            />
            {nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm mb-1">Phone Number</label>
            <div className="flex items-center border rounded px-2">
              <Icon icon="mdi:phone" className="text-gray-500" />
              <input
                type="tel"
                className="flex-1 p-2 outline-none"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="e.g. 08012345678"
              />
            </div>
            {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm mb-1">Email</label>
            <div className="flex items-center border rounded px-2">
              <Icon icon="mdi:email-outline" className="text-gray-500" />
              <input
                type="email"
                className="flex-1 p-2 outline-none"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="Enter email"
              />
            </div>
            {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm mb-1">Password</label>
            <div className="flex items-center border rounded px-2">
              <Icon icon="mdi:lock-outline" className="text-gray-500" />
              <input
                type={showPassword ? "text" : "password"}
                className="flex-1 p-2 outline-none"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="ml-2 text-xs"
              >
                {showPassword ? "hide" : "show"}
              </button>
            </div>
            {passwordError && (
              <p className="text-red-500 text-xs mt-1">{passwordError}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm mb-1">Address</label>
            <input
              type="text"
              className="w-full border rounded p-2 outline-none"
              value={address}
              onChange={(e) => handleAddressChange(e.target.value)}
              placeholder="Street, City"
            />
            {addressError && (
              <p className="text-red-500 text-xs mt-1">{addressError}</p>
            )}
          </div>

          {/* LGA Dropdown */}
          <div>
            <label className="block text-sm mb-1">LGA</label>
            <select
              className="w-full border rounded p-2 outline-none"
              value={lga}
              onChange={(e) => setLga(e.target.value)}
            >
              <option value="">Select LGA</option>
              <option value="Gwale">Gwale</option>
              <option value="Nassarawa">Nassarawa</option>
              <option value="Tarauni">Tarauni</option>
            </select>
            {lgaError && <p className="text-red-500 text-xs mt-1">{lgaError}</p>}
          </div>

          {/* Zip */}
          <div>
            <label className="block text-sm mb-1">Zip Code</label>
            <input
              type="text"
              className="w-full border rounded p-2 outline-none"
              value={zip}
              onChange={(e) => handleZipChange(e.target.value)}
              placeholder="e.g. 700001"
            />
            {zipError && <p className="text-red-500 text-xs mt-1">{zipError}</p>}
          </div>
        </div>

        {/* Terms */}
        <div className="mt-3 flex items-center">
          <input
            type="checkbox"
            id="agree"
            className="w-4 h-4 accent-[rgb(36,157,119)] mr-2"
            checked={agree}
            onChange={() => setAgree(!agree)}
          />
          <label htmlFor="agree" className="text-sm gap-1 flex flex-wrap">
            I agree with the 
            <Link to = "/TermsPrivacy" className="hover:underline">
            Terms and Privacy
            </Link>
          </label>
        </div>
        {agreeError && <p className="text-red-500 text-xs mb-2">{agreeError}</p>}

        <button
          type="submit"
          className="w-full bg-[rgb(36,157,119)] text-white py-2 rounded hover:opacity-90 mt-3"
        >
          Create Account
        </button>

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
