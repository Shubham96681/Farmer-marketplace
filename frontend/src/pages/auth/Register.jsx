import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    phone: "+234",
    username: "",
    password: "",
    confirm_password: "",
    first_name: "",
    last_name: "",
    address: "",
    city: "",
    state: "",
    country: "Nigeria",
    role: "",
    user_type: "",
    terms_agreed: false,
    farm_name: "",
    farm_size: "",
    farm_type: "",
    years_farming: "",
    business_name: "",
    business_type: "",
    business_reg_number: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [activeStep, setActiveStep] = useState(1);
  const [pendingEmail, setPendingEmail] = useState("");
  const navigate = useNavigate();

  const API_URL = "http://localhost:8002/api/auth";

  // Determine if we need step 3 based on role and user type
  const needsStep3 = formData.role === "farmer" || (formData.role === "buyer" && formData.user_type === "business");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    // Phone number validation - only numbers, max 10 digits after +234
    if (name === "phone") {
      const digits = value.replace(/\D/g, '').slice(0, 13);
      const formatted = digits.startsWith('234') ? `+${digits}` : `+234${digits.slice(3)}`;
      setFormData(prev => ({ ...prev, phone: formatted.slice(0, 14) }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: newValue,
    }));

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const setRole = (role) => {
    setFormData(prev => ({
      ...prev,
      role: role,
      farm_name: "",
      farm_size: "",
      farm_type: "",
      years_farming: "",
      business_name: "",
      business_type: "",
      business_reg_number: "",
    }));
  };

  const setUserType = (userType) => {
    setFormData(prev => ({
      ...prev,
      user_type: userType,
      business_name: "",
      business_type: "",
      business_reg_number: "",
    }));
  };

  const validateField = (name, value) => {
    const errors = {};

    switch (name) {
      case 'first_name':
        if (!value.trim()) errors[name] = "First name is required";
        break;
      case 'last_name':
        if (!value.trim()) errors[name] = "Last name is required";
        break;
      case 'email':
        if (!value.trim()) errors[name] = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors[name] = "Invalid email format";
        break;
      case 'phone':
        if (!value.trim()) errors[name] = "Phone is required";
        else if (!/^\+234[0-9]{10}$/.test(value)) errors[name] = "Phone must be +234 followed by 10 digits";
        break;
      case 'username':
        if (!value.trim()) errors[name] = "Username is required";
        break;
      case 'password':
        if (!value) errors[name] = "Password is required";
        else if (value.length < 8) errors[name] = "Password must be at least 8 characters";
        else if (!/(?=.*[A-Z])/.test(value)) errors[name] = "Must contain uppercase letter";
        else if (!/(?=.*[a-z])/.test(value)) errors[name] = "Must contain lowercase letter";
        else if (!/(?=.*\d)/.test(value)) errors[name] = "Must contain a number";
        break;
      case 'confirm_password':
        if (!value) errors[name] = "Please confirm password";
        else if (value !== formData.password) errors[name] = "Passwords don't match";
        break;
      case 'address':
        if (!value.trim()) errors[name] = "Address is required";
        break;
      case 'city':
        if (!value.trim()) errors[name] = "City is required";
        break;
      case 'state':
        if (!value.trim()) errors[name] = "State is required";
        break;
      case 'farm_name':
        if (formData.role === 'farmer' && !value.trim()) errors[name] = "Farm name is required";
        break;
      case 'farm_size':
        if (formData.role === 'farmer' && !value.trim()) errors[name] = "Farm size is required";
        break;
      case 'farm_type':
        if (formData.role === 'farmer' && !value.trim()) errors[name] = "Farm type is required";
        break;
      case 'business_name':
        if (formData.role === 'buyer' && formData.user_type === 'business' && !value.trim()) errors[name] = "Business name is required";
        break;
      case 'business_type':
        if (formData.role === 'buyer' && formData.user_type === 'business' && !value.trim()) errors[name] = "Business type is required";
        break;
      case 'business_reg_number':
        if (formData.role === 'buyer' && formData.user_type === 'business' && !value.trim()) errors[name] = "Registration number is required";
        break;
    }

    return errors;
  };

  const validateStep = (step) => {
    const errors = {};
    let hasErrors = false;

    if (step === 1) {
      if (!formData.role) {
        errors.role = "Please select your role";
        hasErrors = true;
      }
      if (!formData.user_type) {
        errors.user_type = "Please select account type";
        hasErrors = true;
      }
      if (!formData.terms_agreed) {
        errors.terms_agreed = "You must agree to the terms";
        hasErrors = true;
      }
    }

    if (step === 2) {
      const fields = ['first_name', 'last_name', 'email', 'phone', 'username', 'password', 'confirm_password', 'address', 'city', 'state'];
      fields.forEach(field => {
        const fieldErrors = validateField(field, formData[field]);
        if (fieldErrors[field]) {
          errors[field] = fieldErrors[field];
          hasErrors = true;
        }
      });
    }

    if (step === 3) {
      if (formData.role === "farmer") {
        const farmerFields = ['farm_name', 'farm_size', 'farm_type'];
        farmerFields.forEach(field => {
          const fieldErrors = validateField(field, formData[field]);
          if (fieldErrors[field]) {
            errors[field] = fieldErrors[field];
            hasErrors = true;
          }
        });
      }

      if (formData.role === "buyer" && formData.user_type === "business") {
        const businessFields = ['business_name', 'business_type', 'business_reg_number'];
        businessFields.forEach(field => {
          const fieldErrors = validateField(field, formData[field]);
          if (fieldErrors[field]) {
            errors[field] = fieldErrors[field];
            hasErrors = true;
          }
        });
      }
    }

    setFieldErrors(errors);
    return hasErrors;
  };

  const nextStep = () => {
    if (validateStep(activeStep)) {
      setMessage("❌ Please fill out all required fields correctly");
      return;
    }

    // Individual buyers skip to verification after step 2
    if (activeStep === 2 && formData.role === "buyer" && formData.user_type === "individual") {
      handleRegister();
      return;
    }

    setActiveStep(activeStep + 1);
    setMessage("");
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setActiveStep(activeStep - 1);
    setMessage("");
    setFieldErrors({});
    window.scrollTo(0, 0);
  };

  const handleRegister = async (e) => {
    if (e) e.preventDefault();

    if (validateStep(activeStep)) {
      setMessage("❌ Please fill out all required fields correctly");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const registrationData = {
        email: formData.email,
        phone: formData.phone,
        username: formData.username,
        password: formData.password,
        confirm_password: formData.confirm_password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        role: formData.role,
        user_type: formData.user_type,
        terms_agreed: formData.terms_agreed,
        farm_name: formData.farm_name || null,
        farm_size: formData.farm_size || null,
        farm_type: formData.farm_type || null,
        years_farming: formData.years_farming ? parseInt(formData.years_farming) : null,
        business_name: formData.business_name || null,
        business_type: formData.business_type || null,
        business_reg_number: formData.business_reg_number || null,
      };

      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationData),
      });

      const responseData = await response.json();

      if (response.ok) {
        setPendingEmail(formData.email);
        setActiveStep(needsStep3 ? 4 : 3);
        setMessage("✅ Verification code sent to your email!");
      } else {
        setMessage(`❌ ${responseData.detail || "Registration failed"}`);
      }
    } catch (error) {
      setMessage(`❌ Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async () => {
    if (!verificationCode) {
      setMessage("❌ Please enter verification code");
      return;
    }

    if (verificationCode.length !== 6) {
      setMessage("❌ Verification code must be 6 digits");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: pendingEmail,
          verification_code: verificationCode
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        setMessage("✅ Account verified successfully! Redirecting to login...");

        if (responseData.access_token) {
          localStorage.setItem('authToken', responseData.access_token);
          localStorage.setItem('user', JSON.stringify(responseData.user));
        }

        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMessage(`❌ ${responseData.detail || "Verification failed"}`);
      }
    } catch (error) {
      setMessage("❌ Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail }),
      });

      const responseData = await response.json();

      if (response.ok) {
        setMessage("✅ New verification code sent!");
      } else {
        setMessage(`❌ ${responseData.detail || "Failed to resend code"}`);
      }
    } catch (error) {
      setMessage("❌ Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Progress Steps - dynamic based on user type
  const steps = [
    { number: 1, title: "Account Type" },
    { number: 2, title: "Basic Info" },
    ...(needsStep3 ? [{ number: 3, title: formData.role === "farmer" ? "Farm Details" : "Business Info" }] : []),
    { number: needsStep3 ? 4 : 3, title: "Verify Email" }
  ];

  // Step 4: Email Verification
  if (activeStep === (needsStep3 ? 4 : 3)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <h1 className="text-4xl font-bold text-green-800"> FarmConnect</h1>
            </Link>
            <p className="text-green-600 mt-2">Verify Your Email</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📧</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Check Your Email</h2>
              <p className="text-gray-600 mt-2">
                We sent a verification code to <strong>{pendingEmail}</strong>
              </p>
              <p className="text-sm text-gray-500 mt-1">Check your inbox or spam folder</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code (6 digits)
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-xl font-mono focus:ring-2 focus:ring-green-500"
                  maxLength={6}
                />
              </div>

              <button
                onClick={handleVerification}
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-green-400 transition-colors"
              >
                {loading ? "Verifying..." : "Verify Email"}
              </button>

              <button
                onClick={resendVerification}
                disabled={loading}
                className="w-full text-green-600 py-2 rounded-lg font-medium hover:text-green-700 disabled:text-green-400"
              >
                Resend Code
              </button>

              <button
                onClick={() => setActiveStep(needsStep3 ? 3 : 2)}
                className="w-full text-gray-600 py-2 rounded-lg font-medium hover:text-gray-700"
              >
                ← Back to Registration
              </button>
            </div>

            {message && (
              <div className={`mt-4 p-3 rounded-lg text-center ${
                message.startsWith("✅") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}>
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-4xl font-bold text-green-800"> FarmConnect</h1>
          </Link>
          <p className="text-green-600 mt-2">Join our community of farmers and buyers</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className={`flex flex-col items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-semibold transition-all duration-300 ${
                    activeStep >= step.number
                      ? 'bg-green-600 border-green-600 text-white'
                      : 'bg-white border-green-300 text-green-300'
                  }`}>
                    {step.number}
                  </div>
                  <span className={`text-xs mt-2 font-medium hidden sm:block ${
                    activeStep >= step.number ? 'text-green-700' : 'text-green-400'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 transition-all duration-300 ${
                    activeStep > step.number ? 'bg-green-600' : 'bg-green-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-green-200 overflow-hidden">
          <form onSubmit={handleRegister} className="p-6 sm:p-8">
            {/* Step 1: Account Type */}
            {activeStep === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Role</h2>
                  <p className="text-gray-600">Select how you want to use FarmConnect</p>
                </div>

                <div className="grid gap-4">
                  <div
                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                      formData.role === "buyer"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 bg-gray-50 hover:border-green-300"
                    }`}
                    onClick={() => setRole("buyer")}
                  >
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                        formData.role === "buyer" ? "border-green-500 bg-green-500" : "border-gray-400"
                      }`}>
                        {formData.role === "buyer" && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">I'm a Buyer</h3>
                        <p className="text-sm text-gray-600 mt-1">Looking to purchase fresh farm products</p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                      formData.role === "farmer"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 bg-gray-50 hover:border-green-300"
                    }`}
                    onClick={() => setRole("farmer")}
                  >
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                        formData.role === "farmer" ? "border-green-500 bg-green-500" : "border-gray-400"
                      }`}>
                        {formData.role === "farmer" && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">I'm a Farmer</h3>
                        <p className="text-sm text-gray-600 mt-1">Want to sell my farm products</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Account Type</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className={`p-4 text-center rounded-lg cursor-pointer transition-all duration-200 border ${
                        formData.user_type === "individual"
                          ? "bg-green-100 border-green-500 text-green-700"
                          : "bg-gray-50 border-gray-200 text-gray-600 hover:border-green-300"
                      }`}
                      onClick={() => setUserType("individual")}
                    >
                      <span className="font-medium">Individual</span>
                    </div>
                    <div
                      className={`p-4 text-center rounded-lg cursor-pointer transition-all duration-200 border ${
                        formData.user_type === "business"
                          ? "bg-green-100 border-green-500 text-green-700"
                          : "bg-gray-50 border-gray-200 text-gray-600 hover:border-green-300"
                      }`}
                      onClick={() => setUserType("business")}
                    >
                      <span className="font-medium">Business</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center pt-4">
                  <input
                    type="checkbox"
                    name="terms_agreed"
                    checked={formData.terms_agreed}
                    onChange={handleChange}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    I agree to the <Link to="/terms" className="text-green-600 hover:underline">Terms and Conditions</Link>
                  </label>
                  {fieldErrors.terms_agreed && (
                    <p className="ml-2 text-sm text-red-600">{fieldErrors.terms_agreed}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Basic Information */}
            {activeStep === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Information</h2>
                  <p className="text-gray-600">Tell us about yourself</p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                        fieldErrors.first_name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {fieldErrors.first_name && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.first_name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                        fieldErrors.last_name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {fieldErrors.last_name && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.last_name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Username *</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                        fieldErrors.username ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {fieldErrors.username && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.username}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                        fieldErrors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {fieldErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                        fieldErrors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="+234XXXXXXXXXX"
                    />
                    {fieldErrors.phone && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.phone}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                        fieldErrors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {fieldErrors.password && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
                    <input
                      type="password"
                      name="confirm_password"
                      value={formData.confirm_password}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                        fieldErrors.confirm_password ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {fieldErrors.confirm_password && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.confirm_password}</p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                        fieldErrors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {fieldErrors.address && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.address}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                        fieldErrors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {fieldErrors.city && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.city}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                        fieldErrors.state ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {fieldErrors.state && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.state}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Role-specific Information (Only for Farmers and Business Buyers) */}
            {activeStep === 3 && needsStep3 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {formData.role === "farmer" ? "Farm Details" : "Business Information"}
                  </h2>
                  <p className="text-gray-600">
                    {formData.role === "farmer" ? "Tell us about your farm" : "Tell us about your business"}
                  </p>
                </div>

                {formData.role === "farmer" ? (
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Farm Name *</label>
                      <input
                        type="text"
                        name="farm_name"
                        value={formData.farm_name}
                        onChange={handleChange}
                        required
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                          fieldErrors.farm_name ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {fieldErrors.farm_name && (
                        <p className="mt-1 text-sm text-red-600">{fieldErrors.farm_name}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Farm Size *</label>
                      <input
                        type="text"
                        name="farm_size"
                        value={formData.farm_size}
                        onChange={handleChange}
                        required
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                          fieldErrors.farm_size ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {fieldErrors.farm_size && (
                        <p className="mt-1 text-sm text-red-600">{fieldErrors.farm_size}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Farm Type *</label>
                      <input
                        type="text"
                        name="farm_type"
                        value={formData.farm_type}
                        onChange={handleChange}
                        required
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                          fieldErrors.farm_type ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {fieldErrors.farm_type && (
                        <p className="mt-1 text-sm text-red-600">{fieldErrors.farm_type}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Years Farming</label>
                      <input
                        type="number"
                        name="years_farming"
                        value={formData.years_farming}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Business Name *</label>
                      <input
                        type="text"
                        name="business_name"
                        value={formData.business_name}
                        onChange={handleChange}
                        required
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                          fieldErrors.business_name ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {fieldErrors.business_name && (
                        <p className="mt-1 text-sm text-red-600">{fieldErrors.business_name}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Business Type *</label>
                      <input
                        type="text"
                        name="business_type"
                        value={formData.business_type}
                        onChange={handleChange}
                        required
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                          fieldErrors.business_type ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {fieldErrors.business_type && (
                        <p className="mt-1 text-sm text-red-600">{fieldErrors.business_type}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Registration Number *</label>
                      <input
                        type="text"
                        name="business_reg_number"
                        value={formData.business_reg_number}
                        onChange={handleChange}
                        required
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                          fieldErrors.business_reg_number ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {fieldErrors.business_reg_number && (
                        <p className="mt-1 text-sm text-red-600">{fieldErrors.business_reg_number}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className={`flex ${activeStep === 1 ? 'justify-end' : 'justify-between'} mt-8 pt-6 border-t border-gray-200`}>
              {activeStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  ← Back
                </button>
              )}

              {activeStep < (needsStep3 ? 3 : 2) ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors ml-auto"
                >
                  Continue →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors ml-auto flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Sending Verification...
                    </>
                  ) : (
                    'Send Verification Code'
                  )}
                </button>
              )}
            </div>

            {message && (
              <div className={`mt-4 p-4 rounded-lg text-center font-medium ${
                message.startsWith("✅")
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}>
                {message}
              </div>
            )}
          </form>

          <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-green-600 font-semibold hover:text-green-700 transition-colors">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;