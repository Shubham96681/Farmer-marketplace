import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const API_URL = "http://localhost:8002/api/auth";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ✅ ENHANCED TOKEN STORAGE WITH VERIFICATION
  const storeAuthData = (token, user) => {
    try {
      console.log("💾 Storing auth data...");

      // Clear any existing data first
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      localStorage.removeItem("tokenExpiry");

      // Store new data
      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Set token expiry (24 hours)
      const expiry = new Date();
      expiry.setHours(expiry.getHours() + 24);
      localStorage.setItem("tokenExpiry", expiry.toISOString());

      console.log("✅ Auth data stored successfully");

      // ✅ VERIFY STORAGE IMMEDIATELY
      const storedToken = localStorage.getItem("authToken");
      const storedUser = localStorage.getItem("user");

      console.log("🔍 STORAGE VERIFICATION:");
      console.log("🔍 Token stored:", storedToken ? `YES (${storedToken.substring(0, 20)}...)` : "NO");
      console.log("🔍 User stored:", storedUser ? `YES (${storedUser.substring(0, 50)}...)` : "NO");

      if (!storedToken) {
        throw new Error("Token storage failed - token is null/undefined");
      }

      return true;
    } catch (error) {
      console.error("❌ Error storing auth data:", error);
      return false;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setMessage("❌ Please fill in all fields");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      console.log("🚀 Sending login request to:", `${API_URL}/login`);
      console.log("📧 Login data:", { email: formData.email, password: "***" });

      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();

      // DEBUG: Log the entire response
      console.log("🔍 FULL API RESPONSE:", responseData);
      console.log("🔍 Response status:", response.status);
      console.log("🔍 Has access_token:", !!responseData.access_token);
      console.log("🔍 Has user:", !!responseData.user);
      console.log("🔍 User role:", responseData.user?.role);

      if (response.ok) {
        if (responseData.access_token && responseData.user) {
          // ✅ ENHANCED STORAGE WITH VERIFICATION
          const storageSuccess = storeAuthData(responseData.access_token, responseData.user);

          if (!storageSuccess) {
            setMessage("❌ Failed to store authentication data");
            return;
          }

          setMessage("✅ Login successful! Redirecting...");

          // ✅ VERIFY REDIRECTION DATA
          console.log("🎯 Redirecting with:");
          console.log("🎯 Role:", responseData.user.role);
          console.log("🎯 User ID:", responseData.user.id);
          console.log("🎯 Token exists:", !!localStorage.getItem("authToken"));

          // Redirect based on user role
          setTimeout(() => {
            if (responseData.user.role === "farmer") {
              console.log("🚜 Redirecting to FARMER dashboard");
              navigate("/farmer-dashboard");
            } else if (responseData.user.role === "buyer") {
              console.log("🛒 Redirecting to BUYER dashboard");
              navigate("/buyer-dashboard");
            } else {
              console.log("❓ Unknown role, redirecting to home");
              navigate("/");
            }
          }, 1500);

        } else {
          setMessage("❌ Invalid response: Missing token or user data");
          console.error("❌ Response missing required fields:", {
            access_token: !!responseData.access_token,
            user: !!responseData.user
          });
        }
      } else {
        setMessage(`❌ ${responseData.detail || "Login failed"}`);
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      setMessage(`❌ Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ✅ DEBUG FUNCTION - Check current storage
  const debugStorage = () => {
    console.log("🔍 CURRENT STORAGE DEBUG:");
    console.log("authToken:", localStorage.getItem("authToken"));
    console.log("user:", localStorage.getItem("user"));
    console.log("tokenExpiry:", localStorage.getItem("tokenExpiry"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-4xl font-bold text-green-800"> FarmConnect</h1>
          </Link>
          <p className="text-green-600 mt-2">Welcome back to your farming community</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
            <p className="text-gray-600 mt-2">Enter your credentials to access your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email or Username *
              </label>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Enter your email or username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-green-400 transition-colors flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            {message && (
              <div className={`p-3 rounded-lg text-center font-medium ${
                message.startsWith("✅")
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}>
                {message}
              </div>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link to="/register" className="text-green-600 font-semibold hover:text-green-700 transition-colors">
                Sign up here
              </Link>
            </p>
          </div>

          {/* Debug button - remove in production */}
          <div className="mt-4 text-center">
            <button
              onClick={debugStorage}
              className="text-xs text-gray-500 hover:text-gray-700 border border-gray-300 px-2 py-1 rounded"
            >
              Debug Storage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;