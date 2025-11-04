// src/api-test.js
const API_URL = "http://localhost:8000/auth";

export const testRegistration = async () => {
  const testData = {
    email: "test@example.com",
    phone: "+1234567890",
    username: "testuser",
    password: "Test123!",
    confirm_password: "Test123!",
    first_name: "Test",
    last_name: "User",
    address: "123 Test St",
    city: "Test City",
    state: "Test State",
    country: "Nigeria",
    role: "buyer",
    user_type: "individual",
    terms_agreed: true
  };

  try {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Registration failed');
    }

    const result = await response.json();
    console.log("✅ Registration test successful:", result);
    return result;
  } catch (error) {
    console.error("❌ Registration test failed:", error.message);
    throw error;
  }
};

export const testVerification = async (email, verificationCode) => {
  try {
    const response = await fetch(`${API_URL}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email,
        verification_code: verificationCode
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Verification failed');
    }

    const result = await response.json();
    console.log("✅ Verification test successful:", result);
    return result;
  } catch (error) {
    console.error("❌ Verification test failed:", error.message);
    throw error;
  }
};

// Usage in your React component:
// import { testRegistration, testVerification } from './api-test';