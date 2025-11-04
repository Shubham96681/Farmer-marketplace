import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "./components/Layout/Layout.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import VerifyEmail from "./pages/auth/VerifyEmail.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Products from "./pages/Products.jsx";
import HowItWorks from "./pages/how-it-works.jsx"; // Fixed: unique name
import PrivacyPolicy from "./pages/Privacy.jsx"; // Fixed: unique name
import TermsOfService from "./pages/Terms.jsx"; // Fixed: unique name
import FarmersAgreement from "./pages/Agreement.jsx"; // Fixed: unique name
import "./index.css";
import FarmerDashboard from "./components/FarmerDashboard";
import BuyerDashboard from "./components/BuyerDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";   // ✅ Theme context
import { LanguageProvider } from "./contexts/LanguageContext.jsx"; // ✅ Language context

// Create a query client
const queryClient = new QueryClient();

// Public Route wrapper (redirects if already authenticated)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return !user ? children : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <LanguageProvider>
            <Router
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Layout><Home /></Layout>} />
                <Route path="/login" element={<PublicRoute><Layout><Login /></Layout></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><Layout><Register /></Layout></PublicRoute>} />
                <Route path="/verify-email" element={<PublicRoute><Layout><VerifyEmail /></Layout></PublicRoute>} />
                <Route path="/forgot-password" element={<PublicRoute><Layout><ForgotPassword /></Layout></PublicRoute>} />
                <Route path="/reset-password" element={<PublicRoute><Layout><ResetPassword /></Layout></PublicRoute>} />
                <Route path="/how-it-works" element={<Layout><HowItWorks /></Layout>} />
                <Route path="/Privacy" element={<Layout><PrivacyPolicy /></Layout>} />
                <Route path="/Terms" element={<Layout><TermsOfService /></Layout>} />
                <Route path="/Agreement" element={<Layout><FarmersAgreement /></Layout>} />

                {/* TEMPORARY: Direct access for testing */}
                <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
                <Route path="/buyer-dashboard" element={<BuyerDashboard />} />

                {/* Protected routes */}
                <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
                <Route path="/products" element={<ProtectedRoute><Layout><Products /></Layout></ProtectedRoute>} />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Router>
          </LanguageProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;