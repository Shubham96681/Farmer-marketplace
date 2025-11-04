import React, { useState, useEffect } from "react";
import { ArrowRight, ShoppingCart, ShieldCheck, Leaf, Clock, Car, Star, Plus, Minus, X, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
// Note: Assuming these contexts and hooks are available in the user's project
// import { useAuth } from "../contexts/AuthContext";

// The component is self-contained for easy viewing and editing.
const Home = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [cartItems, setCartItems] = useState({});
  const [showCartNotification, setShowCartNotification] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const user = null; // Mock user for demonstration since AuthContext is not provided
  const navigate = useNavigate();

  // Enhanced product data with multiple images (using placeholder images for demonstration)
  const [featuredProducts, setFeaturedProducts] = useState([
    {
      id: 1,
      name: "Fresh Yam",
      price: 4500,
      unit: "per tuber",
      images: [
        "https://i.imgur.com/zHHoGIx.jpeg",
        "https://i.imgur.com/1JWN7cw.jpeg",
        "https://i.imgur.com/chO29oj.jpeg",
        "https://i.imgur.com/chO29oj.jpeg"
      ],
      category: "Tubers",
      farmer: "Organic Farms NG",
      rating: 4.8,
      description: "Fresh, organic yam tubers directly from our farm. Perfect for boiling, frying, or making pounded yam.",
      inStock: true,
      minOrder: 1
    },
    {
      id: 2,
      name: "Irish Potatoes",
      price: 200,
      unit: "per kg",
      images: [
        "https://i.imgur.com/gOIojW0.jpeg",
        "https://i.imgur.com/dSR4kYf.jpeg",
        "https://i.imgur.com/d7aZ7wp.jpeg",
        "https://i.imgur.com/3510Hg8.jpeg"
      ],
      category: "Vegetables",
      farmer: "Green Valley Farms",
      rating: 4.5,
      description: "Fresh Irish potatoes, great for chips, boiling, or stews. Grown with sustainable farming practices.",
      inStock: true,
      minOrder: 1
    },
    {
      id: 3,
      name: "Cocoyam",
      price: 419,
      unit: "per kg",
      images: [
        "https://i.imgur.com/Xf16QK4.jpeg",
        "https://i.imgur.com/e7ytfFn.jpeg",
        "https://i.imgur.com/lJnk6mj.jpeg",
        "https://i.imgur.com/e7ytfFn.jpeg"
      ],
      category: "Tubers",
      farmer: "FarmFresh Co.",
      rating: 4.7,
      description: "Fresh cocoyam, perfect for traditional dishes. Rich in nutrients and flavor.",
      inStock: true,
      minOrder: 1
    },
    {
      id: 4,
      name: "Fresh Tomatoes",
      price: 800,
      unit: "per kg",
      images: [
        "https://i.imgur.com/liRoeEu.jpeg",
        "https://i.imgur.com/Wxm1b43.jpeg",
        "https://i.imgur.com/Gjk4XYE.jpeg",
        "https://i.imgur.com/9t8DUjc.jpeg"
      ],
      category: "Vegetables",
      farmer: "Sunrise Farms",
      rating: 4.6,
      description: "Ripe, red tomatoes perfect for stews, sauces, and fresh salads.",
      inStock: true,
      minOrder: 0.5
    },
    {
      id: 5,
      name: "Bell Peppers",
      price: 650,
      unit: "per kg",
      images: [
        "https://i.imgur.com/fq9Ey3w.jpeg",
        "https://i.imgur.com/KgVoc0D.jpeg",
        "https://i.imgur.com/Y6WBCsG.jpeg",
        "https://i.imgur.com/6maLW0U.jpeg"
      ],
      category: "Vegetables",
      farmer: "Green Thumb Farms",
      rating: 4.9,
      description: "Colorful bell peppers in red, yellow, and green. Great for stir-fries and salads.",
      inStock: true,
      minOrder: 0.5
    },
    {
      id: 6,
      name: "Plantains",
      price: 300,
      unit: "per bunch",
      images: [
        "https://i.imgur.com/pocR3eH.jpeg",
        "https://i.imgur.com/NPun70p.jpeg",
        "https://i.imgur.com/l5L6UJ0.jpeg",
        "https://i.imgur.com/Z8UjhmG.jpeg"
      ],
      category: "Fruits",
      farmer: "Tropical Harvest",
      rating: 4.4,
      description: "Fresh plantains, perfect for frying, boiling, or making plantain chips.",
      inStock: true,
      minOrder: 1
    },
  ]);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const handleAddToCart = (product, quantity = 1) => {
    if (!user) {
      // Redirect to signup if user is not logged in
      // navigate('/register');
      setShowCartNotification(true);
      setTimeout(() => setShowCartNotification(false), 2000);
      return;
    }

    // Add to cart logic for logged-in users
    setCartItems(prev => ({
      ...prev,
      [product.id]: (prev[product.id] || 0) + quantity
    }));

    // Show notification
    setShowCartNotification(true);
    setTimeout(() => setShowCartNotification(false), 2000);

    // Close product modal if open
    setSelectedProduct(null);
  };

  const handleQuantityChange = (productId, change) => {
    setCartItems(prev => {
      const currentQuantity = prev[productId] || 0;
      const newQuantity = Math.max(0, currentQuantity + change);

      if (newQuantity === 0) {
        const { [productId]: removed, ...rest } = prev;
        return rest;
      }

      return { ...prev, [productId]: newQuantity };
    });
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setSelectedImageIndex(0);
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
  };

  const nextImage = () => {
    if (selectedProduct) {
      setSelectedImageIndex((prev) =>
        prev === selectedProduct.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedProduct) {
      setSelectedImageIndex((prev) =>
        prev === 0 ? selectedProduct.images.length - 1 : prev - 1
      );
    }
  };

  const getTotalCartItems = () => {
    return Object.values(cartItems).reduce((total, quantity) => total + quantity, 0);
  };

  const testimonials = [
    { text: "FarmConnect is a game-changer! I love getting fresh produce directly from local farmers. The quality is amazing.", author: "Sarah J." },
    { text: "The prices are fair and the service is incredible. My family and I are eating so much healthier now. Highly recommend!", author: "David C." },
    { text: "A simple and reliable way to support local agriculture. The produce arrives fresh and well-packaged every time.", author: "Emily R." },
  ];

  const nextTestimonial = () => {
    setCurrentTestimonialIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(nextTestimonial, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans">
      <script src="https://cdn.tailwindcss.com"></script>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>
        {`
          body { font-family: 'Inter', sans-serif; }
          .hero-background-clip {
            clip-path: polygon(0 0, 100% 0, 100% 85%, 0% 100%);
          }
          @media (min-width: 768px) {
            .hero-background-clip {
              clip-path: polygon(0 0, 100% 0, 100% 90%, 0% 100%);
            }
          }
        `}
      </style>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] relative">
            {/* Close Button - Fixed positioning */}
            <button
              onClick={closeProductModal}
              className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
            >
              <X size={24} />
            </button>
            <div className="relative">
              {/* Product Images */}
              <div className="relative">
                <img
                  src={selectedProduct.images[selectedImageIndex]}
                  alt={selectedProduct.name}
                  className="w-full h-64 md:h-96 object-cover rounded-t-2xl"
                />

                {/* Image Navigation */}
                {selectedProduct.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                    >
                      <ArrowRight size={20} />
                    </button>
                  </>
                )}

                {/* Image Thumbnails */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                  {selectedProduct.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === selectedImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Product Details */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedProduct.name}</h2>
                    <p className="text-green-600 text-xl font-semibold mt-1">
                      ₦{selectedProduct.price} <span className="text-sm text-gray-500 font-normal">{selectedProduct.unit}</span>
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="text-lg font-semibold">{selectedProduct.rating}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                  <span>By {selectedProduct.farmer}</span>
                  <span>•</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">{selectedProduct.category}</span>
                  <span>•</span>
                  <span className={selectedProduct.inStock ? "text-green-600" : "text-red-600"}>
                    {selectedProduct.inStock ? "In Stock" : "Out of Stock"}
                  </span>
                </div>

                <p className="text-gray-700 mb-6">{selectedProduct.description}</p>

                {/* Quantity Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3 border rounded-lg p-2">
                      <button
                        onClick={() => handleQuantityChange(selectedProduct.id, -1)}
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="font-semibold w-8 text-center">
                        {cartItems[selectedProduct.id] || 0}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(selectedProduct.id, 1)}
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <span className="text-sm text-gray-500">Min. order: {selectedProduct.minOrder} {selectedProduct.unit.split('per ')[1]}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleAddToCart(selectedProduct, 1)}
                    className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <ShoppingCart size={20} />
                    <span>Add to Cart</span>
                  </button>
                  <button className="px-6 py-3 border-2 border-green-600 text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-colors">
                    Save for Later
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Notification */}
      {showCartNotification && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce">
          <div className="flex items-center space-x-2">
            <ShoppingCart size={20} />
            <span>Added to cart! {user ? '' : 'Please sign up to continue'}</span>
          </div>
        </div>
      )}

      {/* Cart Icon */}
      {user && getTotalCartItems() > 0 && (
        <div className="fixed top-4 left-4 bg-white shadow-lg rounded-full p-3 z-40">
          <div className="relative">
            <ShoppingCart className="text-green-600" size={24} />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
              {getTotalCartItems()}
            </span>
          </div>
        </div>
      )}

      {/* Hero Section - Redesigned */}
      <section className="relative bg-lime-50 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-no-repeat bg-cover bg-center opacity-30" style={{backgroundImage: "url(https://farmingfarmersfarms.com/wp-content/uploads/2023/10/VEGETATION.jpg)"}}></div>
        <div className="relative max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="relative z-10 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight drop-shadow-lg">
              Fresh Produce, Direct from Farmers
            </h1>
            <p className="mt-4 md:mt-6 text-lg md:text-xl text-gray-700 max-w-xl mx-auto md:mx-0">
              FarmConnect links you to trusted local farmers for affordable, fresh, and healthy food.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/products"
                className="px-8 py-4 bg-green-600 text-white font-bold rounded-full shadow-lg hover:bg-green-700 flex items-center justify-center space-x-2 transition-transform hover:scale-105"
              >
                <span>Browse All Products</span>
                <ArrowRight size={20} />
              </Link>
              <Link
                to="/register"
                className="px-8 py-4 bg-white border-2 border-green-600 text-green-600 font-bold rounded-full hover:bg-green-50 transition-transform hover:scale-105"
              >
                {user ? 'Go to Dashboard' : 'Join Our Community'}
              </Link>
            </div>
          </div>
          <div className="relative z-10 hidden md:flex justify-center">
            <img src="https://i.imgur.com/Gjk4XYE.jpeg" alt="Fresh vegetable basket" className="w-full max-w-lg h-auto rounded-3xl shadow-2xl" />
          </div>
        </div>
      </section>

      {/* Features Section - Styling Refined */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-center">
          <div className="p-8 bg-gray-50 shadow-lg rounded-3xl border border-gray-100 hover:scale-105 transition duration-300">
            <Leaf className="mx-auto text-green-600 mb-4" size={48} />
            <h3 className="text-xl font-bold text-gray-800">Fresh & Healthy</h3>
            <p className="mt-3 text-gray-600">Straight from the farm, with no middlemen.</p>
          </div>
          <div className="p-8 bg-gray-50 shadow-lg rounded-3xl border border-gray-100 hover:scale-105 transition duration-300">
            <ShoppingCart className="mx-auto text-green-600 mb-4" size={48} />
            <h3 className="text-xl font-bold text-gray-800">Affordable Pricing</h3>
            <p className="mt-3 text-gray-600">Better prices for farmers, fair prices for you.</p>
          </div>
          <div className="p-8 bg-gray-50 shadow-lg rounded-3xl border border-gray-100 hover:scale-105 transition duration-300">
            <ShieldCheck className="mx-auto text-green-600 mb-4" size={48} />
            <h3 className="text-xl font-bold text-gray-800">Trusted Sourcing</h3>
            <p className="mt-3 text-gray-600">We verify all farmers for quality and trust.</p>
          </div>
        </div>
      </section>

      {/* Featured Products Section - Redesigned Cards */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Fresh from Our Farms</h2>
            <p className="mt-4 text-lg text-gray-600">Discover the best produce from local Nigerian farmers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="relative bg-white rounded-3xl shadow-xl border border-gray-200 transition-all duration-300 group overflow-hidden cursor-pointer hover:scale-105"
                onClick={() => openProductModal(product)}
              >
                <div className="relative">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                    {product.category}
                  </div>
                </div>

                <div className="p-6 text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{product.name}</h3>
                  <p className="text-lg text-green-600 font-semibold mb-2">₦{product.price} <span className="text-sm text-gray-500 font-normal">{product.unit}</span></p>
                  <div className="flex items-center justify-center space-x-1 text-gray-600 mb-4">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm">{product.rating}</span>
                    <span className="ml-2 text-sm text-gray-500">By {product.farmer}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/products"
              className="inline-flex items-center space-x-2 bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              <span>View All Products</span>
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section - Styling Refined */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div>
              <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-green-100 text-green-600 mb-4">
                <Leaf size={32} />
              </div>
              <h4 className="text-xl font-semibold mb-2">1. Browse Fresh Produce</h4>
              <p className="text-gray-600">Discover seasonal fruits and vegetables from local farms.</p>
            </div>
            <div>
              <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-green-100 text-green-600 mb-4">
                <Clock size={32} />
              </div>
              <h4 className="text-xl font-semibold mb-2">2. Order with Ease</h4>
              <p className="text-gray-600">Place your order online in just a few clicks.</p>
            </div>
            <div>
              <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-green-100 text-green-600 mb-4">
                <Car size={32} />
              </div>
              <h4 className="text-xl font-semibold mb-2">3. Delivered to Your Door</h4>
              <p className="text-gray-600">Your Product is delivered directly from the farm to your home.</p>
            </div>
          </div>
        </div>
      </section>

      {/* New Section: Connection with Farmers */}
      <section className="bg-lime-50 py-20">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              The People Behind Your Plate
            </h2>
            <p className="mt-4 text-lg text-gray-700 max-w-xl mx-auto md:mx-0">
              At FarmConnect, we believe in a direct connection between you and the farmers who grow your food. By purchasing from us, you're not just getting fresh produce; you're supporting local agriculture, empowering communities, and ensuring a sustainable food system for Nigeria.
            </p>
            <div className="mt-8">
              <Link
                to="/register"
                className="inline-flex items-center space-x-2 bg-green-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-700 transition-colors"
              >
                <span>Meet Our Farmers</span>
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
          <div className="order-1 md:order-2 flex justify-center">
            <img
              src="https://www.worldbank.org/content/dam/Worldbank/Feature%20Story/Africa/Nigeria/ng-fadama-takes-nigerian-farmers-to-higher-level-735x490.jpg"
              alt="Nigerian farmer"
              className="w-full max-w-md h-auto rounded-3xl shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Final CTA Section - Refined Styling */}
      <section className="bg-gradient-to-r from-green-700 to-green-800 py-20 text-center text-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-extrabold">Ready to support local farmers?</h2>
          <p className="mt-4 text-lg text-green-100">
            Join thousands of Nigerians enjoying fresh and affordable farmp roduce. delivered to their homes.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="px-10 py-4 bg-white text-green-700 font-bold rounded-full shadow-lg hover:bg-gray-100 transition-transform hover:scale-105"
            >
              {user ? 'Go to Dashboard' : 'Create Your Account'}
            </Link>
            <Link
              to="/products"
              className="px-10 py-4 border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-green-700 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Section - Minor Styling Tweaks */}
      <footer className="bg-green-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <img src="https://i.imgur.com/Yu34GWV.png" alt="FarmConnect logo" className="w-8 h-8 rounded-full" />
                <span className="text-2xl font-bold text-green-100">FarmConnect</span>
              </div>
              <p className="text-green-200 mb-4 max-w-md">
                Connecting Nigerian farmers with buyers for fresh and affordable farm produce.
                Supporting local agriculture while bringing quality food to your table.
              </p>
              <div className="flex space-x-4">
                <span className="text-green-300">Follow us:</span>
                <div className="flex space-x-3">
                  <a href="https://www.facebook.com/profile.php?id=61582174343566" className="text-green-200 hover:text-white transition-colors">Facebook</a>
                  <a href="#" className="text-green-200 hover:text-white transition-colors">Twitter</a>
                  <a href="#" className="text-green-200 hover:text-white transition-colors">Instagram</a>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/products" className="text-green-200 hover:text-white transition-colors">Browse Products</Link></li>
                <li><Link to="/register" className="text-green-200 hover:text-white transition-colors">Create Account</Link></li>
                <li><Link to="/login" className="text-green-200 hover:text-white transition-colors">Login</Link></li>
                <li><Link to="/how-it-works" className="text-green-200 hover:text-white transition-colors">How It Works</Link></li>
                </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <ul className="space-y-2 text-green-200">
                <li>📧 contact@farmconnect.com</li>
                <li>📞 +234 802 263 1595</li>
                <li>📍 ojoto Idemili-South Anambra state, Nigeria</li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-green-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-green-300 text-sm">
              © 2025 FarmConnect. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="/Privacy" className="text-green-300 hover:text-white text-sm transition-colors">Privacy Policy</a>
              <a href="/Terms" className="text-green-300 hover:text-white text-sm transition-colors">Terms of Service</a>
              <a href="/Agreement" className="text-green-300 hover:text-white text-sm transition-colors">Farmers Agreement</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
