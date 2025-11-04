import React from "react";
import { Link } from "react-router-dom";
import { Leaf, ShoppingCart, Truck, Users, Shield, Clock } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: <Leaf className="w-8 h-8" />,
      title: "1. Browse Fresh Produce",
      description: "Explore our wide selection of fresh fruits, vegetables, tubers, and more from trusted local farmers across Nigeria.",
      details: "Filter by category, price, or farmer. Read detailed descriptions and see high-quality images of each product."
    },
    {
      icon: <ShoppingCart className="w-8 h-8" />,
      title: "2. Place Your Order",
      description: "Add items to your cart and checkout securely. Choose your preferred delivery options and payment method.",
      details: "We accept various payment methods including bank transfer, mobile money, and card payments for your convenience."
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: "3. Fast Delivery",
      description: "Your order is processed quickly and delivered fresh to your doorstep within 24-48 hours.",
      details: "We use specialized packaging to ensure your produce arrives fresh and in perfect condition."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "4. Support Local Farmers",
      description: "Your purchase directly supports Nigerian farmers and their communities.",
      details: "By buying through FarmConnect, you're helping to build a sustainable agricultural ecosystem in Nigeria."
    }
  ];

  const benefits = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Quality Guaranteed",
      description: "All our farmers are verified and products are quality-checked before delivery."
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Save Time",
      description: "Skip the market queues and get fresh produce delivered to your home or office."
    },
    {
      icon: <Leaf className="w-6 h-6" />,
      title: "Fresh from Farm",
      description: "Direct from farm to table, ensuring maximum freshness and nutritional value."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Support Local",
      description: "Your purchase directly benefits local farmers and their communities."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <script src="https://cdn.tailwindcss.com"></script>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How FarmConnect Works
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connecting you directly with local farmers for fresh, affordable produce.
            Simple, transparent, and designed with both farmers and buyers in mind.
          </p>
        </div>

        {/* Steps Section */}
        <div className="mb-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center text-green-600 mx-auto mb-4">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-700 mb-3">{step.description}</p>
                <p className="text-sm text-gray-500">{step.details}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Visual Process Flow */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple & Efficient Process</h2>
            <p className="text-gray-600">From browsing to delivery, we've made the process seamless for everyone</p>
          </div>

          <div className="relative">
            {/* Process Timeline */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-green-200 transform -translate-y-1/2"></div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative">
              {steps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="bg-white border-2 border-green-500 w-12 h-12 rounded-full flex items-center justify-center text-green-600 mx-auto mb-4 relative z-10">
                    <span className="font-bold text-lg">{index + 1}</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">{step.title.split(' ').slice(1).join(' ')}</h4>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose FarmConnect?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're revolutionizing the way Nigerians access fresh farm produce with technology and trust.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="text-green-600 mb-4">
                  {benefit.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* For Farmers Section */}
        <div className="bg-green-50 rounded-2xl p-8 mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">For Farmers</h2>
            <p className="text-gray-700 max-w-2xl mx-auto">
              Join our platform to reach more customers and grow your business
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center text-green-600 mx-auto mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Reach More Customers</h3>
              <p className="text-gray-600 text-sm">Connect with buyers across Nigeria</p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center text-green-600 mx-auto mb-4">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Fair Prices</h3>
              <p className="text-gray-600 text-sm">Get better prices by eliminating middlemen</p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center text-green-600 mx-auto mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Secure Payments</h3>
              <p className="text-gray-600 text-sm">Receive payments securely and on time</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of Nigerians enjoying fresh, affordable produce delivered to their homes while supporting local farmers.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Create Your Account
            </Link>
            <Link
              to="/products"
              className="border-2 border-green-600 text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">How long does delivery take?</h3>
              <p className="text-gray-600 mb-4">Delivery typically takes 24-48 hours depending on your location.</p>

              <h3 className="font-bold text-gray-900 mb-2">What areas do you deliver to?</h3>
              <p className="text-gray-600 mb-4">We currently deliver to major cities across Nigeria with plans to expand.</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">How are the farmers verified?</h3>
              <p className="text-gray-600 mb-4">All farmers undergo a thorough verification process including farm visits and quality checks.</p>

              <h3 className="font-bold text-gray-900 mb-2">Can I return products?</h3>
              <p className="text-gray-600 mb-4">Yes, we have a satisfaction guarantee policy for quality issues.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;