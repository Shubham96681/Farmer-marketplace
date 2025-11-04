import React from "react";
import { Link } from "react-router-dom";
import { FileText, Scale, AlertTriangle, CheckCircle, XCircle, Users } from "lucide-react";

const TermsOfService = () => {
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
              <Scale size={32} />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start">
            <AlertTriangle className="text-yellow-600 mr-3 mt-1 flex-shrink-0" size={24} />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Important Notice</h3>
              <p className="text-yellow-700">
                Please read these Terms of Service carefully before using FarmConnect. By accessing or using our platform,
                you agree to be bound by these terms. If you do not agree to these terms, please do not use our services.
              </p>
            </div>
          </div>
        </div>

        {/* Agreement Section */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <div className="flex items-center mb-6">
            <FileText className="text-green-600 mr-3" size={24} />
            <h2 className="text-2xl font-bold text-gray-900">1. Agreement to Terms</h2>
          </div>
          <p className="text-gray-700 mb-4">
            These Terms of Service constitute a legally binding agreement made between you ("User", "Buyer", "Farmer")
            and FarmConnect ("Company", "we", "us", "our"), concerning your access to and use of the FarmConnect platform.
          </p>
        </div>

        {/* User Accounts */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">2. User Accounts</h2>

          <div className="space-y-6">
            <div className="flex items-start">
              <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Eligibility</h3>
                <p className="text-gray-700">
                  You must be at least 18 years old to create an account and use FarmConnect. By creating an account,
                  you represent that you meet this requirement.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Account Security</h3>
                <p className="text-gray-700">
                  You are responsible for maintaining the confidentiality of your account credentials and for all
                  activities that occur under your account. Notify us immediately of any unauthorized use.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <XCircle className="text-red-500 mr-3 mt-1 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Prohibited Activities</h3>
                <p className="text-gray-700">
                  You may not use FarmConnect for any illegal or unauthorized purpose. You must not violate any laws
                  in your jurisdiction, including copyright laws.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Buying and Selling */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <div className="flex items-center mb-6">
            <Users className="text-green-600 mr-3" size={24} />
            <h2 className="text-2xl font-bold text-gray-900">3. Buying and Selling</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">For Buyers</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <CheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" size={16} />
                  <span>All orders are subject to product availability</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" size={16} />
                  <span>Prices are as listed and in Nigerian Naira (₦)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" size={16} />
                  <span>Delivery times are estimates and may vary</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" size={16} />
                  <span>Quality complaints must be reported within 24 hours of delivery</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">For Farmers</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <CheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" size={16} />
                  <span>You must provide accurate product descriptions and images</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" size={16} />
                  <span>Maintain product quality as described</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" size={16} />
                  <span>Fulfill orders in a timely manner</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" size={16} />
                  <span>Comply with all applicable agricultural regulations</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Payments and Fees */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Payments and Fees</h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Processing</h3>
              <p className="text-gray-700">
                All payments are processed through secure payment gateways. FarmConnect does not store your payment
                card details. By providing payment information, you represent that you are authorized to use the
                payment method.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Service Fees</h3>
              <p className="text-gray-700">
                FarmConnect may charge service fees for transactions. These fees will be clearly displayed before
                you complete any transaction. We reserve the right to change our fee structure with prior notice.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Refunds and Cancellations</h3>
              <p className="text-gray-700">
                Refunds are processed in accordance with our refund policy. Orders can be cancelled before they are
                shipped. Once shipped, cancellations may not be possible.
              </p>
            </div>
          </div>
        </div>

        {/* Intellectual Property */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Intellectual Property</h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Our Content</h3>
              <p className="text-gray-700">
                The FarmConnect platform, including its original content, features, functionality, and design elements
                are owned by FarmConnect and are protected by international copyright, trademark, and other intellectual
                property laws.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Content</h3>
              <p className="text-gray-700">
                By posting content on FarmConnect, you grant us a non-exclusive, worldwide, royalty-free license to use,
                display, and distribute your content in connection with the platform.
              </p>
            </div>
          </div>
        </div>

        {/* Limitation of Liability */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Limitation of Liability</h2>

          <div className="bg-red-50 rounded-lg p-6 mb-4">
            <h3 className="font-semibold text-red-800 mb-3">Important Disclaimer</h3>
            <p className="text-red-700">
              To the maximum extent permitted by law, FarmConnect shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages, including without limitation, loss of profits, data, use,
              goodwill, or other intangible losses.
            </p>
          </div>

          <p className="text-gray-700">
            FarmConnect acts as a marketplace connecting buyers and farmers. We are not responsible for the quality,
            safety, or legality of products listed by farmers. Users transact at their own risk.
          </p>
        </div>

        {/* Termination */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Termination</h2>

          <div className="space-y-4">
            <p className="text-gray-700">
              We may terminate or suspend your account and bar access to the platform immediately, without prior notice
              or liability, under our sole discretion, for any reason whatsoever, including but not limited to a breach
              of the Terms.
            </p>

            <p className="text-gray-700">
              Upon termination, your right to use the platform will cease immediately. If you wish to terminate your
              account, you may simply discontinue using the platform or contact us to delete your account.
            </p>
          </div>
        </div>

        {/* Governing Law */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Governing Law</h2>
          <p className="text-gray-700">
            These Terms shall be governed and construed in accordance with the laws of Nigeria, without regard to its
            conflict of law provisions. Any disputes shall be subject to the exclusive jurisdiction of the courts located
            in Anambra State, Nigeria.
          </p>
        </div>

        {/* Changes to Terms */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">9. Changes to Terms</h2>
          <p className="text-gray-700 mb-4">
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is
            material, we will provide at least 30 days' notice prior to any new terms taking effect.
          </p>
          <p className="text-gray-700">
            By continuing to access or use our platform after any revisions become effective, you agree to be bound by
            the revised terms.
          </p>
        </div>

        {/* Contact Information */}
        <div className="bg-green-50 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-gray-700 mb-4">
            If you have any questions about these Terms of Service, please contact us:
          </p>
          <div className="space-y-2 text-gray-700">
            <p>📧 legal@farmconnect.com</p>
            <p>📞 +234 802 263 1595</p>
            <p>📍 Ojoto, Idemili-South, Anambra State, Nigeria</p>
          </div>
        </div>

        {/* Acceptance Section */}
        <div className="bg-blue-50 rounded-2xl p-6 mt-8 text-center">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Acceptance of Terms</h3>
          <p className="text-blue-700">
            By using FarmConnect, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </p>
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

export default TermsOfService;