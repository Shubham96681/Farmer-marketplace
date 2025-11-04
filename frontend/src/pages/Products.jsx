import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Star, Search } from "lucide-react";

const Products = () => {
  const navigate = useNavigate();

  const [products] = useState([
    {
      id: 1,
      name: "Fresh Yam",
      price: 4500,
      unit: "per tuber",
      image: "https://i.imgur.com/zHHoGIx.jpeg",
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
      image: "https://i.imgur.com/gOIojW0.jpeg",
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
      image: "https://i.imgur.com/Xf16QK4.jpeg",
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
      image: "https://i.imgur.com/liRoeEu.jpeg",
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
      image: "https://i.imgur.com/fq9Ey3w.jpeg",
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
      image: "https://i.imgur.com/pocR3eH.jpeg",
      category: "Fruits",
      farmer: "Tropical Harvest",
      rating: 4.4,
      description: "Fresh plantains, perfect for frying, boiling, or making plantain chips.",
      inStock: true,
      minOrder: 1
    },
    {
      id: 7,
      name: "Carrots",
      price: 350,
      unit: "per kg",
      image: "https://i.imgur.com/U2FCCda.jpeg",
      category: "Vegetables",
      farmer: "Fresh Fields NG",
      rating: 4.6,
      description: "Sweet and crunchy carrots, perfect for cooking or snacking.",
      inStock: true,
      minOrder: 0.5
    },
    {
      id: 8,
      name: "Onions",
      price: 250,
      unit: "per kg",
      image: "https://i.imgur.com/nrBLEG2.jpeg",
      category: "Vegetables",
      farmer: "Local Harvest",
      rating: 4.3,
      description: "Fresh onions with strong flavor, ideal for various dishes.",
      inStock: true,
      minOrder: 0.5
    },
    {
      id: 9,
      name: "Garlic",
      price: 500,
      unit: "per kg",
      image: "https://i.imgur.com/3510Hg8.jpeg",
      category: "Vegetables",
      farmer: "Spice Farms",
      rating: 4.7,
      description: "Fresh garlic with intense flavor and aroma.",
      inStock: true,
      minOrder: 0.2
    }
  ]);

  const [filteredProducts, setFilteredProducts] = useState(products);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("name");

  const categories = ["All", "Tubers", "Vegetables", "Fruits"];

  // Filter and sort products
  useEffect(() => {
    let result = products;

    // Filter by search term
    if (searchTerm) {
      result = result.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.farmer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "All") {
      result = result.filter(product => product.category === selectedCategory);
    }

    // Sort products
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "rating":
          return b.rating - a.rating;
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(result);
  }, [products, searchTerm, selectedCategory, sortBy]);

  const handleAddToCart = (product) => {
    // Redirect to register page when Add to Cart is clicked
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <script src="https://cdn.tailwindcss.com"></script>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Header is already provided by Layout component in App.jsx */}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Products</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover fresh, high-quality produce directly from Nigerian farmers.
            Support local agriculture while enjoying the best nature has to offer.
          </p>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              💡 <strong>Tip:</strong> Sign up to add items to your cart and start shopping!
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 left-3 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                  {product.category}
                </div>
                {product.inStock && (
                  <div className="absolute top-3 right-3 bg-white text-green-600 px-2 py-1 rounded-full text-xs font-semibold">
                    In Stock
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-semibold">{product.rating}</span>
                  </div>
                </div>

                <p className="text-green-600 text-lg font-semibold mb-2">
                  ₦{product.price} <span className="text-sm text-gray-500 font-normal">{product.unit}</span>
                </p>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>By {product.farmer}</span>
                  <span>Min: {product.minOrder} {product.unit.split('per ')[1]}</span>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <ShoppingCart size={18} />
                    <span>Add to Cart</span>
                  </button>
                </div>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Sign up required to add to cart
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* No Results Message */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search size={64} className="mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
                setSortBy("name");
              }}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Results Count */}
        <div className="text-center text-gray-600 mb-8">
          Showing {filteredProducts.length} of {products.length} products
        </div>

        {/* CTA Section */}
        <div className="text-center bg-green-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start Shopping?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Create an account to add items to your cart, save your favorites, and enjoy fresh farm produce delivered to your doorstep.
          </p>
          <Link
            to="/register"
            className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors inline-flex items-center space-x-2"
          >
            <span>Create Your Account</span>
            <ShoppingCart size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Products;