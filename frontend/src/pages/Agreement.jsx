import React from "react";
import { Link } from "react-router-dom";
import { UserCheck, Truck, Shield, DollarSign, CheckCircle, XCircle, FileText } from "lucide-react";

const FarmersAgreement = () => {
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
              <UserCheck size={32} />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Farmers Agreement
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Partnership Terms for Farmers on FarmConnect Platform
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Welcome Section */}
        <div className="bg-green-50 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to FarmConnect!</h2>
          <p className="text-gray-700">
            Thank you for choosing to partner with FarmConnect. This agreement outlines the terms and conditions
            governing your use of our platform as a verified farmer. By registering as a farmer on FarmConnect,
            you agree to comply with these terms.
          </p>
        </div>

        {/* Eligibility Requirements */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <div className="flex items-center mb-6">
            <UserCheck className="text-green-600 mr-3" size={24} />
            <h2 className="text-2xl font-bold text-gray-900">1. Farmer Eligibility</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-start">
              <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Verification Requirements</h3>
                <p className="text-gray-700">
                  All farmers must undergo a verification process including farm inspection, documentation review,
                  and quality assessment before being approved to sell on FarmConnect.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Legal Compliance</h3>
                <p className="text-gray-700">
                  Farmers must comply with all Nigerian agricultural regulations, food safety standards, and
                  have necessary permits and certifications for their farming operations.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Experience & Capacity</h3>
                <p className="text-gray-700">
                  Farmers should have demonstrated farming experience and the capacity to fulfill orders
                  consistently while maintaining quality standards.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Standards */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Product Quality Standards</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Freshness Guarantee</h4>
              <p className="text-gray-700 text-sm">
                All produce must be fresh, properly harvested, and meet the quality standards described in listings.
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Accurate Descriptions</h4>
              <p className="text-gray-700 text-sm">
                Product listings must accurately represent the quality, quantity, and characteristics of your produce.
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Organic Certification</h4>
              <p className="text-gray-700 text-sm">
                If claiming organic status, valid certification must be provided and maintained.
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Pricing Transparency</h4>
              <p className="text-gray-700 text-sm">
                All prices must be clearly stated and include any additional charges or fees.
              </p>
            </div>
          </div>
        </div>

        {/* Order Fulfillment */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <div className="flex items-center mb-6">
            <Truck className="text-green-600 mr-3" size={24} />
            <h2 className="text-2xl font-bold text-gray-900">3. Order Fulfillment</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Processing Time</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Orders must be processed within 24 hours of receipt</li>
                <li>Same-day harvesting for maximum freshness</li>
                <li>Immediate notification of any delays or issues</li>
                <li>Coordination with FarmConnect delivery partners</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Packaging Standards</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Use approved packaging materials provided by FarmConnect</li>
                <li>Proper labeling with product information and farmer details</li>
                <li>Temperature control for perishable items</li>
                <li>Secure packaging to prevent damage during transit</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Payments & Commissions */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <div className="flex items-center mb-6">
            <DollarSign className="text-green-600 mr-3" size={24} />
            <h2 className="text-2xl font-bold text-gray-900">4. Payments & Commission</h2>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Payment Schedule</h3>
              <p className="text-gray-700">
                Payments to farmers are processed weekly. Funds from completed orders are transferred every Friday
                to your registered bank account.
              </p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Commission Structure</h3>
              <div className="space-y-2">
                <p className="text-gray-700">
                  FarmConnect charges a commission of 15% on all successful transactions. This commission covers:
                </p>
                <ul className="list-disc list-inside text-gray-700 ml-4">
                  <li>Platform maintenance and development</li>
                  <li>Customer support services</li>
                  <li>Marketing and customer acquisition</li>
                  <li>Payment processing fees</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Pricing Guidelines</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Set fair market prices for your products</li>
                <li>Consider quality, production costs, and market demand</li>
                <li>Maintain consistent pricing unless market conditions change</li>
                <li>Notify FarmConnect of significant price changes</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quality Assurance */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <div className="flex items-center mb-6">
            <Shield className="text-green-600 mr-3" size={24} />
            <h2 className="text-2xl font-bold text-gray-900">5. Quality Assurance & Compliance</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Regular Inspections</h3>
              <p className="text-gray-700 mb-4">
                FarmConnect reserves the right to conduct periodic farm inspections and quality audits to ensure
                compliance with our standards. These inspections may be announced or unannounced.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Customer Feedback</h3>
              <p className="text-gray-700 mb-4">
                Farmers must maintain a minimum rating of 4.0 stars. Consistently low ratings or negative feedback
                may result in account review or suspension.
              </p>
            </div>

            <div className="bg-red-50 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2">Zero Tolerance Policy</h3>
              <p className="text-red-700">
                FarmConnect has a zero-tolerance policy for fraudulent activities, misrepresentation of products,
                or violation of food safety standards. Such violations will result in immediate account termination.
              </p>
            </div>
          </div>
        </div>

        {/* Farmer Responsibilities */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Farmer Responsibilities</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">Inventory Management</h3>
              <p className="text-gray-700 text-sm">
                Keep product listings updated with accurate stock levels and availability.
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">Customer Communication</h3>
              <p className="text-gray-700 text-sm">
                Respond to customer inquiries and order updates within 12 hours.
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">Issue Resolution</h3>
              <p className="text-gray-700 text-sm">
                Work collaboratively with FarmConnect to resolve customer complaints and issues.
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">Platform Updates</h3>
              <p className="text-gray-700 text-sm">
                Stay informed about platform updates, policy changes, and best practices.
              </p>
            </div>
          </div>
        </div>

        {/* Prohibited Activities */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Prohibited Activities</h2>

          <div className="space-y-4">
            <div className="flex items-start">
              <XCircle className="text-red-500 mr-3 mt-1 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Direct Sales</h3>
                <p className="text-gray-700">
                  Farmers shall not use FarmConnect platform to facilitate direct sales outside the platform
                  or attempt to bypass FarmConnect commission structure.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <XCircle className="text-red-500 mr-3 mt-1 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Misrepresentation</h3>
                <p className="text-gray-700">
                  False advertising, misleading product descriptions, or use of stock images that don't represent
                  actual products is strictly prohibited.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <XCircle className="text-red-500 mr-3 mt-1 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Price Manipulation</h3>
                <p className="text-gray-700">
                  Artificial price inflation, collusion with other farmers, or unfair pricing practices are not allowed.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Termination */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Agreement Duration & Termination</h2>

          <div className="space-y-4">
            <p className="text-gray-700">
              This agreement remains in effect until terminated by either party. Farmers may terminate this agreement
              by providing 30 days written notice and fulfilling all pending orders.
            </p>

            <p className="text-gray-700">
              FarmConnect may suspend or terminate a farmer's account immediately for violation of this agreement,
              with written notice provided to the farmer.
            </p>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-green-50 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Farmer Benefits</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center text-green-600 mx-auto mb-3">
                <UserCheck size={24} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Wider Market Reach</h3>
              <p className="text-gray-700 text-sm">Access customers across Nigeria</p>
            </div>

            <div className="text-center">
              <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center text-green-600 mx-auto mb-3">
                <DollarSign size={24} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Fair Pricing</h3>
              <p className="text-gray-700 text-sm">Better prices by eliminating middlemen</p>
            </div>

            <div className="text-center">
              <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center text-green-600 mx-auto mb-3">
                <Shield size={24} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Secure Payments</h3>
              <p className="text-gray-700 text-sm">Timely and guaranteed payments</p>
            </div>
          </div>
        </div>

        {/* Contact & Support */}
        <div className="bg-blue-50 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Farmer Support</h2>
          <p className="text-gray-700 mb-4">
            Our dedicated farmer support team is here to help you succeed on FarmConnect.
          </p>
          <div className="space-y-2 text-gray-700">
            <p>📧 farmers@farmconnect.com</p>
            <p>📞 +234 802 263 1595 (Farmer Support Line)</p>
            <p>📍 Ojoto, Idemili-South, Anambra State, Nigeria</p>
          </div>
        </div>

        {/* Acceptance Section */}
        <div className="bg-green-100 rounded-2xl p-6 mt-8 text-center">
          <h3 className="text-lg font-semibold text-green-800 mb-2">Ready to Join FarmConnect?</h3>
          <p className="text-green-700 mb-4">
            By registering as a farmer on FarmConnect, you acknowledge that you have read, understood,
            and agree to be bound by this Farmers Agreement.
          </p>
          <Link
            to="/register"
            className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors inline-flex items-center space-x-2"
          >
            <UserCheck size={20} />
            <span>Apply as a Farmer</span>
          </Link>
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

export default FarmersAgreement;