import React from "react";
import { Link } from "react-router-dom";
import { Shield, Lock, Eye, UserCheck } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <script src="https://cdn.tailwindcss.com"></script>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center text-green-600">
              <Shield size={32} />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
          <p className="text-gray-700 mb-4">
            At FarmConnect, we are committed to protecting your privacy and ensuring the security of your personal information.
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
          </p>
          <p className="text-gray-700">
            By accessing or using FarmConnect, you agree to the terms of this Privacy Policy. If you do not agree with the terms,
            please do not access the platform.
          </p>
        </div>

        {/* Information We Collect */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <div className="flex items-center mb-6">
            <UserCheck className="text-green-600 mr-3" size={24} />
            <h2 className="text-2xl font-bold text-gray-900">Information We Collect</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Personal Information</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Name, email address, and phone number</li>
                <li>Delivery address and location data</li>
                <li>Payment information (processed securely through our payment partners)</li>
                <li>Account credentials and profile information</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Usage Information</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Browser type and device information</li>
                <li>IP address and general location data</li>
                <li>Pages visited and features used</li>
                <li>Transaction history and preferences</li>
              </ul>
            </div>
          </div>
        </div>

        {/* How We Use Your Information */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <div className="flex items-center mb-6">
            <Eye className="text-green-600 mr-3" size={24} />
            <h2 className="text-2xl font-bold text-gray-900">How We Use Your Information</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Service Delivery</h4>
              <p className="text-gray-700 text-sm">
                Process orders, facilitate deliveries, and provide customer support
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Communication</h4>
              <p className="text-gray-700 text-sm">
                Send order updates, service announcements, and promotional offers
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Platform Improvement</h4>
              <p className="text-gray-700 text-sm">
                Analyze usage patterns to enhance user experience and develop new features
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Security</h4>
              <p className="text-gray-700 text-sm">
                Protect against fraud, unauthorized transactions, and security threats
              </p>
            </div>
          </div>
        </div>

        {/* Data Sharing */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Sharing and Disclosure</h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">With Farmers</h3>
              <p className="text-gray-700">
                We share necessary order information (delivery address, contact details) with farmers to fulfill your orders.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Service Providers</h3>
              <p className="text-gray-700">
                We work with trusted partners for payment processing, delivery services, and analytics.
                These providers only receive information necessary to perform their functions.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Legal Requirements</h3>
              <p className="text-gray-700">
                We may disclose information when required by law or to protect our rights, users, or the public.
              </p>
            </div>
          </div>
        </div>

        {/* Data Security */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <div className="flex items-center mb-6">
            <Lock className="text-green-600 mr-3" size={24} />
            <h2 className="text-2xl font-bold text-gray-900">Data Security</h2>
          </div>

          <p className="text-gray-700 mb-4">
            We implement appropriate technical and organizational security measures to protect your personal information
            against unauthorized access, alteration, disclosure, or destruction.
          </p>

          <div className="bg-green-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Our Security Measures Include:</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>SSL encryption for data transmission</li>
              <li>Secure payment processing through certified providers</li>
              <li>Regular security assessments and updates</li>
              <li>Limited access to personal information on a need-to-know basis</li>
              <li>Secure data storage with access controls</li>
            </ul>
          </div>
        </div>

        {/* Your Rights */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Rights and Choices</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">Access and Update</h3>
              <p className="text-gray-700 text-sm">
                You can access and update your personal information through your account settings.
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">Data Portability</h3>
              <p className="text-gray-700 text-sm">
                Request a copy of your personal data in a structured, machine-readable format.
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">Deletion</h3>
              <p className="text-gray-700 text-sm">
                Request deletion of your personal information, subject to legal requirements.
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">Marketing Preferences</h3>
              <p className="text-gray-700 text-sm">
                Opt-out of marketing communications at any time through your account settings.
              </p>
            </div>
          </div>
        </div>

        {/* Cookies */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies and Tracking</h2>
          <p className="text-gray-700 mb-4">
            We use cookies and similar tracking technologies to enhance your experience, analyze platform usage,
            and deliver personalized content. You can control cookie preferences through your browser settings.
          </p>
        </div>

        {/* Children's Privacy */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Children's Privacy</h2>
          <p className="text-gray-700">
            FarmConnect is not intended for children under 18 years of age. We do not knowingly collect personal
            information from children. If you believe we have collected information from a child, please contact us immediately.
          </p>
        </div>

        {/* Changes to Policy */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Policy</h2>
          <p className="text-gray-700 mb-4">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new
            Privacy Policy on this page and updating the "Last updated" date.
          </p>
          <p className="text-gray-700">
            Your continued use of FarmConnect after any modifications indicates your acceptance of the updated policy.
          </p>
        </div>

        {/* Contact Information */}
        <div className="bg-green-50 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-gray-700 mb-4">
            If you have any questions about this Privacy Policy or our data practices, please contact us:
          </p>
          <div className="space-y-2 text-gray-700">
            <p>📧 privacy@farmconnect.com</p>
            <p>📞 +234 802 263 1595</p>
            <p>📍 Ojoto, Idemili-South, Anambra State, Nigeria</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="text-center mt-12">
          <Link
            to="/"
            className="text-green-600 hover:text-green-700 font-semibold inline-flex items-center space-x-2"
          >
            <span>← Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;